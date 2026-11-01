// SPDX-FileCopyrightText: 2026 Dominik Wadowski
// SPDX-License-Identifier: FSL-1.1-ALv2

import type { ModuleTransaction } from "@offgrid/db";
import { INSTANCE_SETTINGS_KEY } from "../constants.js";
import type { InstanceSettings } from "../types.js";

export const readInstanceSettings = async (tx: ModuleTransaction): Promise<InstanceSettings> => {
  const row = await tx.instanceSettings.findUniqueOrThrow({
    where: { settingKey: INSTANCE_SETTINGS_KEY },
  });
  return { registrationOpen: row.registrationOpen };
};
