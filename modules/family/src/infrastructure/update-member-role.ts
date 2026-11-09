// SPDX-FileCopyrightText: 2026 Dominik Wadowski
// SPDX-License-Identifier: FSL-1.1-ALv2

import type { FamilyRole } from "@offgrid/access-control";
import type { ModuleTransaction } from "@offgrid/db";
import type { FamilyMember } from "../types.js";
import { toFamilyMember } from "./to-family-member.js";

export const updateMemberRole = async (
  tx: ModuleTransaction,
  familyId: string,
  userId: string,
  role: FamilyRole,
): Promise<FamilyMember> =>
  toFamilyMember(
    await tx.familyMember.update({
      where: { familyId_userId: { familyId, userId } },
      data: { role },
    }),
  );
