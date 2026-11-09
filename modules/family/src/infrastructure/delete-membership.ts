// SPDX-FileCopyrightText: 2026 Dominik Wadowski
// SPDX-License-Identifier: FSL-1.1-ALv2

import type { ModuleTransaction } from "@offgrid/db";

export const deleteMembership = async (
  tx: ModuleTransaction,
  familyId: string,
  userId: string,
): Promise<void> => {
  await tx.familyMember.delete({ where: { familyId_userId: { familyId, userId } } });
};
