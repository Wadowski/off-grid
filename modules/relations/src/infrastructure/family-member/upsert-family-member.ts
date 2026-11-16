// SPDX-FileCopyrightText: 2026 Dominik Wadowski
// SPDX-License-Identifier: FSL-1.1-ALv2

import type { ModuleTransaction } from "@offgrid/db";
import type { FamilyMembershipChange } from "../../types.js";

export const upsertFamilyMember = async (
  tx: ModuleTransaction,
  change: FamilyMembershipChange & { readonly isMember: boolean },
): Promise<void> => {
  const key = { familyId_userId: { familyId: change.familyId, userId: change.userId } };
  await tx.relationsFamilyMember.upsert({
    where: key,
    create: {
      familyId: change.familyId,
      userId: change.userId,
      sourceVersion: change.sourceVersion,
      isMember: change.isMember,
    },
    update: { sourceVersion: change.sourceVersion, isMember: change.isMember },
  });
};
