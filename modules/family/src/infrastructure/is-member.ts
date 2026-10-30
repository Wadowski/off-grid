// SPDX-FileCopyrightText: 2026 Dominik Wadowski
// SPDX-License-Identifier: FSL-1.1-ALv2

import type { ModuleTransaction } from "@offgrid/db";

export const isMember = async (
  tx: ModuleTransaction,
  familyId: string,
  userId: string,
): Promise<boolean> => {
  const membership = await tx.familyMember.findUnique({
    where: { familyId_userId: { familyId, userId } },
  });
  return membership !== null;
};
