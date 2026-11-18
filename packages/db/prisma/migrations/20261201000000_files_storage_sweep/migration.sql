-- SPDX-FileCopyrightText: 2026 Dominik Wadowski
-- SPDX-License-Identifier: FSL-1.1-ALv2

CREATE POLICY file_version_storage_sweep_read ON files.file_version
  FOR SELECT
  USING (current_setting('app.files_storage_sweep', true) = 'on');
