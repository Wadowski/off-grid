// SPDX-FileCopyrightText: 2026 Dominik Wadowski
// SPDX-License-Identifier: FSL-1.1-ALv2

import type { ModuleTransaction } from "@offgrid/db";
import type { FamilySummary } from "../types.js";

export const listFamiliesForUser = async (
  tx: ModuleTransaction,
  userId: string,
): Promise<FamilySummary[]> => {
  const memberships = await tx.familyMember.findMany({
    where: { userId },
    include: { family: true },
    orderBy: [{ family: { name: "asc" } }, { familyId: "asc" }],
  });
  return memberships.map((membership) => ({
    id: membership.family.familyId,
    name: membership.family.name,
  }));
};
