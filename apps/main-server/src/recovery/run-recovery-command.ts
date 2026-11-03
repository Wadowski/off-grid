// SPDX-FileCopyrightText: 2026 Dominik Wadowski
// SPDX-License-Identifier: FSL-1.1-ALv2

import type { ModuleDatabase } from "@offgrid/db";
import {
  createRecoveryAdmin,
  resetAdminPasswordByEmail,
  type IssuedPasswordReset,
} from "@offgrid/identity";
import { RECOVERY_USAGE } from "../constants.js";
import { requireOption } from "./require-option.js";
import type { RecoveryCommandValues } from "../types.js";

export const runRecoveryCommand = async (
  command: string | undefined,
  values: RecoveryCommandValues,
  db: ModuleDatabase,
): Promise<IssuedPasswordReset> => {
  if (command === "reset-password") {
    return resetAdminPasswordByEmail(db, requireOption(values.email, "--email"));
  }
  if (command === "create-admin") {
    return createRecoveryAdmin(db, {
      email: requireOption(values.email, "--email"),
      displayName: requireOption(values.name, "--name"),
    });
  }
  throw new Error(RECOVERY_USAGE);
};
