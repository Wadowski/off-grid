// SPDX-FileCopyrightText: 2026 Dominik Wadowski
// SPDX-License-Identifier: FSL-1.1-ALv2

import type { ModuleDatabase } from "@offgrid/db";
import { readUpdateSettings } from "../../infrastructure/update-settings/read-update-settings.js";
import type { SystemNightlySetting } from "../../types.js";

export const readNightlyForUpdater = async (db: ModuleDatabase): Promise<SystemNightlySetting> => {
  const settings = await readUpdateSettings(db);
  return { enabled: settings.nightlyEnabled };
};
