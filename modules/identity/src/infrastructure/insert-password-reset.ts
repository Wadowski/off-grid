// SPDX-FileCopyrightText: 2026 Dominik Wadowski
// SPDX-License-Identifier: FSL-1.1-ALv2

import type { ModuleTransaction } from "@offgrid/db";
import type { NewPasswordReset } from "../types.js";

export const insertPasswordReset = async (
  tx: ModuleTransaction,
  reset: NewPasswordReset,
): Promise<void> => {
  await tx.passwordReset.create({
    data: {
      passwordResetId: reset.id,
      userId: reset.userId,
      codeHash: reset.codeHash,
      expiresAt: reset.expiresAt,
    },
  });
};
