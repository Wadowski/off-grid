// SPDX-FileCopyrightText: 2026 Dominik Wadowski
// SPDX-License-Identifier: FSL-1.1-ALv2

import type { ModuleTransaction } from "@offgrid/db";

export const findFamilyMembership = async (
  tx: ModuleTransaction,
  input: { readonly familyId: string; readonly userId: string },
): Promise<boolean> => {
  const membership = await tx.calendarFamilyMembership.findUnique({
    where: { familyId_userId: { familyId: input.familyId, userId: input.userId } },
  });
  return membership !== null;
};
