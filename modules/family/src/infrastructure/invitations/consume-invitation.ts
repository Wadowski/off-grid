// SPDX-FileCopyrightText: 2026 Dominik Wadowski
// SPDX-License-Identifier: FSL-1.1-ALv2

import type { ModuleTransaction } from "@offgrid/db";

export const consumeInvitation = async (
  tx: ModuleTransaction,
  codeHash: string,
  userId: string,
  now: Date,
): Promise<boolean> => {
  const result = await tx.familyInvitation.updateMany({
    where: { codeHash, usedAt: null, revokedAt: null, expiresAt: { gt: now } },
    data: { usedBy: userId, usedAt: now },
  });
  return result.count === 1;
};
