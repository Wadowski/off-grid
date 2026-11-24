-- SPDX-FileCopyrightText: 2026 Dominik Wadowski
-- SPDX-License-Identifier: FSL-1.1-ALv2

CREATE POLICY file_trash_purge_read ON files.file
  FOR SELECT
  USING (current_setting('app.files_trash_purge', true) = 'on' AND deleted_at IS NOT NULL);

CREATE POLICY family_membership_trash_purge_read ON files.family_membership
  FOR SELECT
  USING (current_setting('app.files_trash_purge', true) = 'on' AND is_member);
