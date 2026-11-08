// SPDX-FileCopyrightText: 2026 Dominik Wadowski
// SPDX-License-Identifier: FSL-1.1-ALv2

import type { ModuleDatabase } from "@offgrid/db";
import type { PasswordRecoveryOptions } from "@offgrid/contracts";
import { readMailSettings } from "../../infrastructure/mail/read-mail-settings.js";

export const getPasswordRecoveryOptions = (db: ModuleDatabase): Promise<PasswordRecoveryOptions> =>
  db.$transaction(async (tx) => ({
    emailCodeAvailable: (await readMailSettings(tx)) !== null,
  }));
