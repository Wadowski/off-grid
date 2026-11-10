-- SPDX-FileCopyrightText: 2026 Dominik Wadowski
-- SPDX-License-Identifier: FSL-1.1-ALv2

ALTER TABLE identity.user_account
  ADD COLUMN display_name_version integer NOT NULL DEFAULT 1 CHECK (display_name_version >= 1);

GRANT UPDATE (display_name_version) ON identity.user_account TO offgrid_app;
