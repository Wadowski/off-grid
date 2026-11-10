-- SPDX-FileCopyrightText: 2026 Dominik Wadowski
-- SPDX-License-Identifier: FSL-1.1-ALv2

-- A read-only copy of each person's display name, fed by identity events.
-- The owner is the person it names. People who share a family can read it.
CREATE TABLE family.account_name (
  user_id        uuid        PRIMARY KEY,
  display_name   text        NOT NULL CHECK (char_length(display_name) BETWEEN 1 AND 100),
  source_version integer     NOT NULL CHECK (source_version >= 1)
);
SELECT public.offgrid_declare_scope('family', 'account_name', 'user');

-- Answers only whether the caller shares a family with the given person.
-- It runs as the migration owner so that it can read membership rows that
-- row-level security hides from the caller; it returns a boolean and nothing else.
CREATE FUNCTION family.shares_family_with(p_user_id uuid)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = pg_catalog, family
AS $fn$
  SELECT EXISTS (
    SELECT 1
      FROM family.family_member AS mine
      JOIN family.family_member AS theirs ON theirs.family_id = mine.family_id
     WHERE mine.user_id = NULLIF(current_setting('app.user_id', true), '')::uuid
       AND theirs.user_id = p_user_id
  );
$fn$;

REVOKE ALL ON FUNCTION family.shares_family_with(uuid) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION family.shares_family_with(uuid) TO offgrid_app;

DROP POLICY account_name_scope ON family.account_name;

CREATE POLICY account_name_own_write ON family.account_name
  FOR ALL
  USING (user_id = NULLIF(current_setting('app.user_id', true), '')::uuid)
  WITH CHECK (user_id = NULLIF(current_setting('app.user_id', true), '')::uuid);

CREATE POLICY account_name_visible_to_family ON family.account_name
  FOR SELECT
  USING (
    user_id = NULLIF(current_setting('app.user_id', true), '')::uuid
    OR family.shares_family_with(user_id)
  );
