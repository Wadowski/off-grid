// SPDX-FileCopyrightText: 2026 Dominik Wadowski
// SPDX-License-Identifier: FSL-1.1-ALv2

import type { ModuleDatabase } from "@offgrid/db";
import { UPDATE_SETTINGS_KEY } from "../../constants.js";
import type { UpdateSettingsRow } from "../../types.js";

export const readUpdateSettings = async (db: ModuleDatabase): Promise<UpdateSettingsRow> => {
  const row = await db.systemUpdateSettings.findUniqueOrThrow({
    where: { settingKey: UPDATE_SETTINGS_KEY },
  });
  return {
    nightlyEnabled: row.nightlyEnabled,
    latestVersion: row.latestVersion,
    updateAvailable: row.updateAvailable,
    updateAllowed: row.updateAllowed,
    checkedAt: row.checkedAt,
  };
};
