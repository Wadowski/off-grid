-- SPDX-FileCopyrightText: 2026 Dominik Wadowski
-- SPDX-License-Identifier: FSL-1.1-ALv2

CREATE TABLE identity.password_reset (
  password_reset_id uuid        PRIMARY KEY,
  user_id           uuid        NOT NULL REFERENCES identity.user_account (user_id),
  code_hash         text        NOT NULL CHECK (char_length(code_hash) > 0),
  created_at        timestamptz NOT NULL DEFAULT now(),
  expires_at        timestamptz NOT NULL,
  used_at           timestamptz,
  retired_at        timestamptz
);
SELECT public.offgrid_declare_scope('identity', 'password_reset', 'user');
CREATE UNIQUE INDEX password_reset_code_hash_key ON identity.password_reset (code_hash);
CREATE UNIQUE INDEX password_reset_one_active_key ON identity.password_reset (user_id)
  WHERE used_at IS NULL AND retired_at IS NULL;

-- True when the request's user is an active instance admin. It is the one deliberate
-- read across rows for admins, so it runs as the owner and skips the row policies.
CREATE FUNCTION identity.is_active_admin() RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = pg_catalog, identity
AS $fn$
  SELECT EXISTS (
    SELECT 1 FROM identity.user_account
    WHERE user_id = NULLIF(current_setting('app.user_id', true), '')::uuid
      AND instance_role = 'admin'
      AND status = 'active'
  );
$fn$;

REVOKE ALL ON FUNCTION identity.is_active_admin() FROM PUBLIC;
GRANT EXECUTE ON FUNCTION identity.is_active_admin() TO offgrid_app;

CREATE POLICY user_account_admin_read ON identity.user_account
  FOR SELECT
  USING (identity.is_active_admin());

CREATE POLICY user_account_admin_update ON identity.user_account
  FOR UPDATE
  USING (identity.is_active_admin())
  WITH CHECK (identity.is_active_admin());

CREATE POLICY session_admin_read ON identity.session
  FOR SELECT
  USING (identity.is_active_admin());

CREATE POLICY session_admin_update ON identity.session
  FOR UPDATE
  USING (identity.is_active_admin())
  WITH CHECK (identity.is_active_admin());

CREATE POLICY password_reset_admin_write ON identity.password_reset
  FOR ALL
  USING (identity.is_active_admin())
  WITH CHECK (identity.is_active_admin());

-- The reset code is presented before anyone is signed in, so the lookup is keyed on
-- the hash the transaction sets, as the sign-in lookups are.
CREATE POLICY password_reset_code_lookup ON identity.password_reset
  FOR SELECT
  USING (code_hash = current_setting('app.reset_code_hash', true));

-- Counts active admins for the host recovery command, which runs as the runtime role
-- and has no signed-in user. It returns only a number, so it is not exposed to requests.
CREATE FUNCTION identity.active_admin_count() RETURNS bigint
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = pg_catalog, identity
AS $fn$
  SELECT count(*) FROM identity.user_account
  WHERE instance_role = 'admin' AND status = 'active';
$fn$;

REVOKE ALL ON FUNCTION identity.active_admin_count() FROM PUBLIC;
GRANT EXECUTE ON FUNCTION identity.active_admin_count() TO offgrid_app;
