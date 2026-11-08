-- SPDX-FileCopyrightText: 2026 Dominik Wadowski
-- SPDX-License-Identifier: FSL-1.1-ALv2

ALTER TABLE identity.mail_settings DROP CONSTRAINT mail_settings_provider_check;

ALTER TABLE identity.mail_settings
  ADD CONSTRAINT mail_settings_provider_check
  CHECK (provider IN ('gmail', 'icloud', 'fastmail', 'outlook', 'other'));
