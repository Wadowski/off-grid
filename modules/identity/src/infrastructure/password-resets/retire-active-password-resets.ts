// SPDX-FileCopyrightText: 2026 Dominik Wadowski
// SPDX-License-Identifier: FSL-1.1-ALv2

import type { ModuleTransaction } from "@offgrid/db";

export const retireActivePasswordResets = async (
  tx: ModuleTransaction,
  userId: string,
  now: Date,
): Promise<void> => {
  await tx.passwordReset.updateMany({
    where: { userId, usedAt: null, retiredAt: null },
    data: { retiredAt: now },
  });
};
