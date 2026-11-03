// SPDX-FileCopyrightText: 2026 Dominik Wadowski
// SPDX-License-Identifier: FSL-1.1-ALv2

import type { ModuleTransaction } from "@offgrid/db";

export const consumeRecoveryCode = async (
  tx: ModuleTransaction,
  userId: string,
  codeHash: string,
): Promise<boolean> => {
  const { count } = await tx.recoveryCode.updateMany({
    where: { userId, codeHash, usedAt: null, retiredAt: null },
    data: { usedAt: new Date() },
  });
  return count === 1;
};
