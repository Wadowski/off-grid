// SPDX-FileCopyrightText: 2026 Dominik Wadowski
// SPDX-License-Identifier: FSL-1.1-ALv2

import type { ModuleDatabase } from "@offgrid/db";
import { readMailSettings } from "../../infrastructure/mail/read-mail-settings.js";
import type { PasswordRecoveryOptions } from "../../types.js";

export const getPasswordRecoveryOptions = (db: ModuleDatabase): Promise<PasswordRecoveryOptions> =>
  db.$transaction(async (tx) => ({
    emailCodeAvailable: (await readMailSettings(tx)) !== null,
  }));
