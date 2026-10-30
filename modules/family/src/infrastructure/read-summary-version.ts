// SPDX-FileCopyrightText: 2026 Dominik Wadowski
// SPDX-License-Identifier: FSL-1.1-ALv2

import type { ClientBase } from "pg";

export const readSummaryVersion = async (
  client: ClientBase,
  userId: string,
  familyId: string,
): Promise<number | null> => {
  const { rows } = await client.query<{ source_version: string }>(
    "SELECT source_version FROM family.family_summary WHERE user_id = $1 AND family_id = $2",
    [userId, familyId],
  );
  return rows[0] === undefined ? null : Number(rows[0].source_version);
};
