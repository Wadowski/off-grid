-- SPDX-FileCopyrightText: 2026 Dominik Wadowski
-- SPDX-License-Identifier: FSL-1.1-ALv2

CREATE POLICY session_access_lookup ON identity.session
  FOR SELECT
  USING (access_token_hash = current_setting('app.access_token_hash', true));
