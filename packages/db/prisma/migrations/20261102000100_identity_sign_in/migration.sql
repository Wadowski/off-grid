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

CREATE POLICY user_account_sign_in_lookup ON identity.user_account
  FOR SELECT
  USING (email = current_setting('app.sign_in_email', true));

CREATE POLICY credential_sign_in_lookup ON identity.credential
  FOR SELECT
  USING (user_id IN (
    SELECT u.user_id FROM identity.user_account u
    WHERE u.email = current_setting('app.sign_in_email', true)
  ));

CREATE POLICY session_refresh_lookup ON identity.session
  FOR SELECT
  USING (
    refresh_token_hash = current_setting('app.refresh_token_hash', true)
    OR previous_refresh_token_hash = current_setting('app.refresh_token_hash', true)
  );
