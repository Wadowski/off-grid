// SPDX-FileCopyrightText: 2026 Dominik Wadowski
// SPDX-License-Identifier: FSL-1.1-ALv2

import { familyAccentSchema, familyPurposeSchema, familyRoleSchema } from "@offgrid/contracts";
import type { ModuleTransaction } from "@offgrid/db";
import type { FamilyListEntry } from "../types.js";

export const listFamiliesForUser = async (
  tx: ModuleTransaction,
  userId: string,
): Promise<FamilyListEntry[]> => {
  const memberships = await tx.familyMember.findMany({
    where: { userId },
    include: { family: true },
    orderBy: [{ family: { name: "asc" } }, { familyId: "asc" }],
  });
  return memberships.map((membership) => ({
    id: membership.family.familyId,
    name: membership.family.name,
    role: familyRoleSchema.parse(membership.role),
    accent: familyAccentSchema.parse(membership.family.accent),
    purpose: familyPurposeSchema.parse(membership.family.purpose),
  }));
};
