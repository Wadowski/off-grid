// SPDX-FileCopyrightText: 2026 Dominik Wadowski
// SPDX-License-Identifier: FSL-1.1-ALv2

export const RESET_SQL = `UPDATE system.update_settings
  SET nightly_enabled = false, latest_version = NULL, update_available = NULL,
      update_allowed = NULL, checked_at = NULL
  WHERE setting_key = 'instance'`;

export const TEST_UPDATER_TOKEN = "test-updater-token";

export const TEST_VERSION = "1.2.3";
