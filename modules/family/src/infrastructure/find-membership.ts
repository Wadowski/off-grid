// SPDX-FileCopyrightText: 2026 Dominik Wadowski
// SPDX-License-Identifier: FSL-1.1-ALv2

import type { ModuleTransaction } from "@offgrid/db";
import type { FamilyMember } from "../types.js";
import { findDisplayNames } from "./find-display-names.js";
import { toFamilyMember } from "./to-family-member.js";

export const findMembership = async (
  tx: ModuleTransaction,
  familyId: string,
  userId: string,
): Promise<FamilyMember | null> => {
  const record = await tx.familyMember.findUnique({
    where: { familyId_userId: { familyId, userId } },
  });
  if (record === null) {
    return null;
  }
  const names = await findDisplayNames(tx, [userId]);
  return toFamilyMember(record, names.get(userId) ?? null);
};
