// SPDX-FileCopyrightText: 2026 Dominik Wadowski
// SPDX-License-Identifier: FSL-1.1-ALv2

import type { ModuleDatabase } from "@offgrid/db";
import { UPDATE_SETTINGS_KEY } from "../../constants.js";

export const writeNightlyUpdate = async (db: ModuleDatabase, enabled: boolean): Promise<void> => {
  await db.systemUpdateSettings.upsert({
    where: { settingKey: UPDATE_SETTINGS_KEY },
    create: { settingKey: UPDATE_SETTINGS_KEY, nightlyEnabled: enabled },
    update: { nightlyEnabled: enabled },
  });
};
