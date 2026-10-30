// SPDX-FileCopyrightText: 2026 Dominik Wadowski
// SPDX-License-Identifier: FSL-1.1-ALv2

import type { ClientBase } from "pg";
import type { FamilySummary } from "../types.js";

export const listSummariesFor = async (
  client: ClientBase,
  userId: string,
): Promise<FamilySummary[]> => {
  const { rows } = await client.query<{ family_id: string; name: string }>(
    "SELECT family_id, name FROM family.family_summary WHERE user_id = $1 ORDER BY name, family_id",
    [userId],
  );
  return rows.map((row) => ({ id: row.family_id, name: row.name }));
};
