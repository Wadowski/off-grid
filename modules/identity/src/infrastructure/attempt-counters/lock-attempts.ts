// SPDX-FileCopyrightText: 2026 Dominik Wadowski
// SPDX-License-Identifier: FSL-1.1-ALv2

import type { ModuleTransaction } from "@offgrid/db";

export const lockAttempts = async (
  tx: ModuleTransaction,
  key: string,
  lockedUntil: Date,
  now: Date,
): Promise<void> => {
  await tx.attemptCounter.update({
    where: { attemptKey: key },
    data: { failures: 0, lockedUntil, updatedAt: now },
  });
};
