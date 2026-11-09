// SPDX-FileCopyrightText: 2026 Dominik Wadowski
// SPDX-License-Identifier: FSL-1.1-ALv2

import type { ModuleTransaction } from "@offgrid/db";

export const revokeInvitation = async (
  tx: ModuleTransaction,
  familyId: string,
  invitationId: string,
  now: Date,
): Promise<boolean> => {
  const result = await tx.familyInvitation.updateMany({
    where: { invitationId, familyId, usedAt: null, revokedAt: null },
    data: { revokedAt: now },
  });
  return result.count > 0;
};
