-- SPDX-FileCopyrightText: 2026 Dominik Wadowski
-- SPDX-License-Identifier: FSL-1.1-ALv2

ALTER TABLE identity.session
  ADD COLUMN previous_refresh_token_hash text
    CHECK (char_length(previous_refresh_token_hash) BETWEEN 32 AND 128),
  ADD COLUMN rotated_at timestamptz,
  ADD COLUMN access_token_hash text
    CHECK (char_length(access_token_hash) BETWEEN 32 AND 128),
  ADD COLUMN access_expires_at timestamptz;

CREATE UNIQUE INDEX session_access_token_hash_key ON identity.session (access_token_hash);

-- Sign-in runs before anyone is signed in, so row-level security would hide the account.
-- Like identity.user_count(), this returns only what sign-in needs and is granted to the runtime role.
CREATE FUNCTION identity.find_account_for_sign_in(p_email text)
RETURNS TABLE (
  user_id uuid,
  email text,
  display_name text,
  instance_role text,
  status text,
  password_hash text
)
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = pg_catalog, identity
AS $fn$
  SELECT u.user_id, u.email, u.display_name, u.instance_role, u.status, c.password_hash
  FROM identity.user_account u
  JOIN identity.credential c ON c.user_id = u.user_id
  WHERE lower(u.email) = lower(p_email);
$fn$;

REVOKE ALL ON FUNCTION identity.find_account_for_sign_in(text) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION identity.find_account_for_sign_in(text) TO offgrid_app;

-- A refresh request has only the cookie, not a user id, so the session is found by the token digest.
-- The digest matches either the current token or the one it replaced (inside the reuse grace window).
CREATE FUNCTION identity.find_session_by_refresh_token(p_token_hash text)
RETURNS TABLE (
  session_id uuid,
  user_id uuid,
  expires_at timestamptz,
  revoked boolean,
  rotated_at timestamptz,
  matched_current boolean,
  account_status text
)
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = pg_catalog, identity
AS $fn$
  SELECT s.session_id, s.user_id, s.expires_at, s.revoked, s.rotated_at,
         s.refresh_token_hash = p_token_hash AS matched_current,
         u.status AS account_status
  FROM identity.session s
  JOIN identity.user_account u ON u.user_id = s.user_id
  WHERE s.refresh_token_hash = p_token_hash OR s.previous_refresh_token_hash = p_token_hash;
$fn$;

REVOKE ALL ON FUNCTION identity.find_session_by_refresh_token(text) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION identity.find_session_by_refresh_token(text) TO offgrid_app;
