-- SPDX-FileCopyrightText: 2026 Dominik Wadowski
-- SPDX-License-Identifier: FSL-1.1-ALv2

ALTER TABLE identity.session ADD COLUMN refresh_token_hash text
  CHECK (char_length(refresh_token_hash) BETWEEN 32 AND 128);

CREATE UNIQUE INDEX session_refresh_token_hash_key ON identity.session (refresh_token_hash);
