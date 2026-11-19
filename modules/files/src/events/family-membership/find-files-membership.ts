// SPDX-FileCopyrightText: 2026 Dominik Wadowski
// SPDX-License-Identifier: FSL-1.1-ALv2

import type { ModuleTransaction } from "@offgrid/db";
import type { StoredMembership } from "@offgrid/family-projection";

export const findFilesMembership = async (
  tx: ModuleTransaction,
  familyId: string,
  userId: string,
): Promise<StoredMembership | null> => {
  const row = await tx.filesFamilyMembership.findUnique({
    where: { familyId_userId: { familyId, userId } },
  });
  return row === null ? null : { sourceVersion: row.sourceVersion };
};
