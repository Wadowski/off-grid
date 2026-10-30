// SPDX-FileCopyrightText: 2026 Dominik Wadowski
// SPDX-License-Identifier: FSL-1.1-ALv2

import type { ClientBase } from "pg";

export const isMember = async (
  client: ClientBase,
  familyId: string,
  userId: string,
): Promise<boolean> => {
  const { rows } = await client.query<{ present: boolean }>(
    "SELECT true AS present FROM family.family_member WHERE family_id = $1 AND user_id = $2",
    [familyId, userId],
  );
  return rows.length > 0;
};
