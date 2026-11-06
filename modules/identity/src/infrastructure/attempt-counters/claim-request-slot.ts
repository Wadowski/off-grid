// SPDX-FileCopyrightText: 2026 Dominik Wadowski
// SPDX-License-Identifier: FSL-1.1-ALv2

import type { ModuleTransaction } from "@offgrid/db";

export const claimRequestSlot = async (
  tx: ModuleTransaction,
  key: string,
  now: Date,
  cooldownMs: number,
): Promise<boolean> => {
  const cooldownStart = new Date(now.getTime() - cooldownMs);
  const { count: refreshed } = await tx.attemptCounter.updateMany({
    where: {
      attemptKey: key,
      OR: [{ requestedAt: null }, { requestedAt: { lte: cooldownStart } }],
    },
    data: { requestedAt: now, updatedAt: now },
  });
  if (refreshed === 1) {
    return true;
  }
  const { count: inserted } = await tx.attemptCounter.createMany({
    data: [{ attemptKey: key, requestedAt: now, updatedAt: now }],
    skipDuplicates: true,
  });
  return inserted === 1;
};
