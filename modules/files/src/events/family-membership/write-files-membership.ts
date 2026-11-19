// SPDX-FileCopyrightText: 2026 Dominik Wadowski
// SPDX-License-Identifier: FSL-1.1-ALv2

import type { ModuleTransaction } from "@offgrid/db";
import type { MembershipChange } from "@offgrid/family-projection";

export const writeFilesMembership = async (
  tx: ModuleTransaction,
  change: MembershipChange,
  isMember: boolean,
): Promise<void> => {
  const key = { familyId_userId: { familyId: change.familyId, userId: change.userId } };
  await tx.filesFamilyMembership.upsert({
    where: key,
    create: {
      familyId: change.familyId,
      userId: change.userId,
      sourceVersion: change.sourceVersion,
      isMember,
    },
    update: { sourceVersion: change.sourceVersion, isMember },
  });
};
