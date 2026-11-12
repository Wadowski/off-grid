// SPDX-FileCopyrightText: 2026 Dominik Wadowski
// SPDX-License-Identifier: FSL-1.1-ALv2

import type { ModuleTransaction } from "@offgrid/db";

export const upsertTimeZone = async (
  tx: ModuleTransaction,
  userId: string,
  timeZone: string,
): Promise<void> => {
  await tx.userTimeZone.upsert({
    where: { userId },
    create: { userId, timeZone },
    update: { timeZone, updatedAt: new Date() },
  });
};
