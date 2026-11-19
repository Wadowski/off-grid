// SPDX-FileCopyrightText: 2026 Dominik Wadowski
// SPDX-License-Identifier: FSL-1.1-ALv2

import type { ModuleDatabase } from "@offgrid/db";
import { UPDATE_SETTINGS_KEY } from "../../constants.js";
import type { UpdateCheckRecord } from "../../types.js";

export const writeUpdateCheck = async (
  db: ModuleDatabase,
  check: UpdateCheckRecord,
): Promise<void> => {
  const columns = {
    latestVersion: check.latestVersion,
    updateAvailable: check.updateAvailable,
    updateAllowed: check.updateAllowed,
    checkedAt: check.checkedAt,
  };
  await db.systemUpdateSettings.upsert({
    where: { settingKey: UPDATE_SETTINGS_KEY },
    create: { settingKey: UPDATE_SETTINGS_KEY, ...columns },
    update: columns,
  });
};
