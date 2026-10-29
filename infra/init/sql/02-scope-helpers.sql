-- SPDX-FileCopyrightText: 2026 Dominik Wadowski
-- SPDX-License-Identifier: FSL-1.1-ALv2
--
-- Declares the ownership scope of a table (ADR 0009). Migrations call it right
-- after creating a table, as the module owner role:
--
--   SELECT public.offgrid_declare_scope('lists', 'list', 'family-or-user');
--
-- It records the scope as a table comment, adds the owner check, enables row
-- level security with a policy, and grants the app role its privileges.
-- It runs with the caller's privileges (not SECURITY DEFINER), so it can only
-- change tables the caller already owns.
--
-- Policies read two per-transaction settings, set by the database package:
--   app.family_id  the family the request acts for
--   app.user_id    the user the request acts for
-- NULLIF turns an unset setting into NULL, so a missing context matches no rows.

CREATE OR REPLACE FUNCTION public.offgrid_declare_scope(
  p_schema text,
  p_table text,
  p_scope text
) RETURNS void
LANGUAGE plpgsql
AS $fn$
DECLARE
  rel text := format('%I.%I', p_schema, p_table);
  app_role text := p_schema || '_app';
  has_family boolean;
  has_user boolean;
  family_required boolean;
  user_required boolean;
BEGIN
  IF p_scope NOT IN ('family-or-user', 'family', 'user', 'shared') THEN
    RAISE EXCEPTION 'unknown ownership scope %', p_scope;
  END IF;

  IF NOT EXISTS (SELECT 1 FROM pg_tables WHERE schemaname = p_schema AND tablename = p_table) THEN
    RAISE EXCEPTION 'table % does not exist', rel;
  END IF;

  SELECT
    EXISTS (SELECT 1 FROM information_schema.columns
             WHERE table_schema = p_schema AND table_name = p_table AND column_name = 'family_id'),
    EXISTS (SELECT 1 FROM information_schema.columns
             WHERE table_schema = p_schema AND table_name = p_table AND column_name = 'user_id')
  INTO has_family, has_user;

  EXECUTE format('COMMENT ON TABLE %s IS %L', rel, 'offgrid:scope=' || p_scope);

  IF p_scope = 'shared' THEN
    IF has_family OR has_user THEN
      RAISE EXCEPTION 'shared table % must not have an owner column', rel;
    END IF;
    EXECUTE format('GRANT SELECT ON %s TO %I', rel, app_role);
    RETURN;
  END IF;

  family_required := p_scope IN ('family', 'family-or-user');
  user_required := p_scope IN ('user', 'family-or-user');

  IF family_required AND NOT has_family THEN
    RAISE EXCEPTION 'scope % needs a family_id column on %', p_scope, rel;
  END IF;
  IF user_required AND NOT has_user THEN
    RAISE EXCEPTION 'scope % needs a user_id column on %', p_scope, rel;
  END IF;

  IF p_scope = 'family-or-user' THEN
    EXECUTE format(
      'ALTER TABLE %s ADD CONSTRAINT %I CHECK ((family_id IS NULL) <> (user_id IS NULL))',
      rel, p_table || '_one_owner'
    );
  ELSIF p_scope = 'family' THEN
    EXECUTE format('ALTER TABLE %s ALTER COLUMN family_id SET NOT NULL', rel);
  ELSE
    EXECUTE format('ALTER TABLE %s ALTER COLUMN user_id SET NOT NULL', rel);
  END IF;

  EXECUTE format('ALTER TABLE %s ENABLE ROW LEVEL SECURITY', rel);
  EXECUTE format(
    'CREATE POLICY %I ON %s USING (%s) WITH CHECK (%s)',
    p_table || '_scope',
    rel,
    CASE p_scope
      WHEN 'family' THEN 'family_id = NULLIF(current_setting(''app.family_id'', true), '''')::uuid'
      WHEN 'user' THEN 'user_id = NULLIF(current_setting(''app.user_id'', true), '''')::uuid'
      ELSE '(family_id IS NOT NULL AND family_id = NULLIF(current_setting(''app.family_id'', true), '''')::uuid)'
        || ' OR (user_id IS NOT NULL AND user_id = NULLIF(current_setting(''app.user_id'', true), '''')::uuid)'
    END,
    CASE p_scope
      WHEN 'family' THEN 'family_id = NULLIF(current_setting(''app.family_id'', true), '''')::uuid'
      WHEN 'user' THEN 'user_id = NULLIF(current_setting(''app.user_id'', true), '''')::uuid'
      ELSE '(family_id IS NOT NULL AND family_id = NULLIF(current_setting(''app.family_id'', true), '''')::uuid)'
        || ' OR (user_id IS NOT NULL AND user_id = NULLIF(current_setting(''app.user_id'', true), '''')::uuid)'
    END
  );

  EXECUTE format('GRANT SELECT, INSERT, UPDATE, DELETE ON %s TO %I', rel, app_role);
END;
$fn$;
