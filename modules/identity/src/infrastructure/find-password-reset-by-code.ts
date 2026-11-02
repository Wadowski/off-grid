// SPDX-FileCopyrightText: 2026 Dominik Wadowski
// SPDX-License-Identifier: FSL-1.1-ALv2

import type { ModuleTransaction } from "@offgrid/db";
import type { PasswordResetRecord } from "../types.js";

export const findPasswordResetByCode = async (
  tx: ModuleTransaction,
  codeHash: string,
): Promise<PasswordResetRecord | null> => {
  const reset = await tx.passwordReset.findFirst({ where: { codeHash } });
  return reset === null
    ? null
    : {
        passwordResetId: reset.passwordResetId,
        userId: reset.userId,
        expiresAt: reset.expiresAt,
        usedAt: reset.usedAt,
        retiredAt: reset.retiredAt,
      };
};
