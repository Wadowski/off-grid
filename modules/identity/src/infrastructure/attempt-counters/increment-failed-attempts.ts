// SPDX-FileCopyrightText: 2026 Dominik Wadowski
// SPDX-License-Identifier: FSL-1.1-ALv2

import type { ModuleTransaction } from "@offgrid/db";

export const incrementFailedAttempts = async (
  tx: ModuleTransaction,
  key: string,
  now: Date,
): Promise<number> => {
  const counter = await tx.attemptCounter.upsert({
    where: { attemptKey: key },
    create: { attemptKey: key, failures: 1, updatedAt: now },
    update: { failures: { increment: 1 }, updatedAt: now },
  });
  return counter.failures;
};
