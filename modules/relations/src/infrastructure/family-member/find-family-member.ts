// SPDX-FileCopyrightText: 2026 Dominik Wadowski
// SPDX-License-Identifier: FSL-1.1-ALv2

import type { ModuleTransaction } from "@offgrid/db";

export const findFamilyMember = async (
  tx: ModuleTransaction,
  key: { readonly familyId: string; readonly userId: string },
): Promise<{ readonly sourceVersion: number; readonly isMember: boolean } | null> =>
  tx.relationsFamilyMember.findUnique({
    where: { familyId_userId: { familyId: key.familyId, userId: key.userId } },
    select: { sourceVersion: true, isMember: true },
  });
