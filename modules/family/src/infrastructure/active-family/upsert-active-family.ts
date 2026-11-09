// SPDX-FileCopyrightText: 2026 Dominik Wadowski
// SPDX-License-Identifier: FSL-1.1-ALv2

import type { ModuleTransaction } from "@offgrid/db";

export const upsertActiveFamily = async (
  tx: ModuleTransaction,
  sessionId: string,
  userId: string,
  familyId: string,
): Promise<void> => {
  await tx.familyActiveFamily.upsert({
    where: { sessionId },
    create: { sessionId, userId, familyId },
    update: { familyId, selectedAt: new Date() },
  });
};
