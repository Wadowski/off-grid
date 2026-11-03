// SPDX-FileCopyrightText: 2026 Dominik Wadowski
// SPDX-License-Identifier: FSL-1.1-ALv2

import type { ModuleDatabase } from "@offgrid/db";
import { countUsers } from "../../infrastructure/accounts/count-users.js";
import { readInstanceSettings } from "../../infrastructure/instance-settings/read-instance-settings.js";
import type { RegistrationStatus } from "../../types.js";

export const getRegistrationStatus = (db: ModuleDatabase): Promise<RegistrationStatus> =>
  db.$transaction(async (tx) => {
    const userCount = await countUsers(tx);
    const settings = await readInstanceSettings(tx);
    return { freshServer: userCount === 0, registrationOpen: settings.registrationOpen };
  });
