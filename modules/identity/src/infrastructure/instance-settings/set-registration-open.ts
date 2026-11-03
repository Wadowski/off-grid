// SPDX-FileCopyrightText: 2026 Dominik Wadowski
// SPDX-License-Identifier: FSL-1.1-ALv2

import type { ModuleTransaction } from "@offgrid/db";
import { INSTANCE_SETTINGS_KEY } from "../../constants.js";

export const setRegistrationOpen = async (tx: ModuleTransaction, open: boolean): Promise<void> => {
  await tx.instanceSettings.update({
    where: { settingKey: INSTANCE_SETTINGS_KEY },
    data: { registrationOpen: open },
  });
};
