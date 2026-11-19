// SPDX-FileCopyrightText: 2026 Dominik Wadowski
// SPDX-License-Identifier: FSL-1.1-ALv2

import type { Client } from "pg";
import type { FamilyMembershipRow } from "./types.js";

export const readFamilyMembership = async (
  admin: Client,
  familyId: string,
  userId: string,
): Promise<FamilyMembershipRow | undefined> => {
  const { rows } = await admin.query<FamilyMembershipRow>(
    "SELECT source_version, is_member FROM calendar.family_membership WHERE family_id = $1 AND user_id = $2",
    [familyId, userId],
  );
  return rows[0];
};
