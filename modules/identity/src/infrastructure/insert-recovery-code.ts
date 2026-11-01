// SPDX-FileCopyrightText: 2026 Dominik Wadowski
// SPDX-License-Identifier: FSL-1.1-ALv2

import type { ModuleTransaction } from "@offgrid/db";
import type { NewRecoveryCode } from "../types.js";

export const insertRecoveryCode = async (
  tx: ModuleTransaction,
  code: NewRecoveryCode,
): Promise<void> => {
  await tx.recoveryCode.create({
    data: { recoveryCodeId: code.id, userId: code.userId, codeHash: code.codeHash },
  });
};
