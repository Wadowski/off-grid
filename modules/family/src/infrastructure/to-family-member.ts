// SPDX-FileCopyrightText: 2026 Dominik Wadowski
// SPDX-License-Identifier: FSL-1.1-ALv2

import { familyRoleSchema } from "@offgrid/contracts";
import type { FamilyMember, FamilyMemberRecord } from "../types.js";

export const toFamilyMember = (record: FamilyMemberRecord): FamilyMember => ({
  userId: record.userId,
  role: familyRoleSchema.parse(record.role),
  joinedAt: record.joinedAt.toISOString(),
});
