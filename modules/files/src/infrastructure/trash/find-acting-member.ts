// SPDX-FileCopyrightText: 2026 Dominik Wadowski
// SPDX-License-Identifier: FSL-1.1-ALv2

import type { ModuleTransaction } from "@offgrid/db";

export const findActingMember = async (
  tx: ModuleTransaction,
  familyId: string,
): Promise<string | null> => {
  const row = await tx.filesFamilyMembership.findFirst({
    where: { familyId, isMember: true },
    select: { userId: true },
    orderBy: { userId: "asc" },
  });
  return row === null ? null : row.userId;
};
