// SPDX-FileCopyrightText: 2026 Dominik Wadowski
// SPDX-License-Identifier: FSL-1.1-ALv2

import type { ModuleTransaction } from "@offgrid/db";

export const markPasswordResetUsed = async (
  tx: ModuleTransaction,
  passwordResetId: string,
  now: Date,
): Promise<boolean> => {
  const { count } = await tx.passwordReset.updateMany({
    where: { passwordResetId, usedAt: null, retiredAt: null },
    data: { usedAt: now },
  });
  return count === 1;
};
