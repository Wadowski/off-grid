// SPDX-FileCopyrightText: 2026 Dominik Wadowski
// SPDX-License-Identifier: FSL-1.1-ALv2

import type { FamilyRole } from "@offgrid/access-control";
import { withFamilyContext, type ModuleDatabase } from "@offgrid/db";

export const addFamilyMember = (
  db: ModuleDatabase,
  familyId: string,
  userId: string,
  role: FamilyRole,
): Promise<void> =>
  db.$transaction(async (tx) => {
    await withFamilyContext(tx, familyId);
    await tx.familyMember.create({ data: { familyId, userId, role } });
  });
