// SPDX-FileCopyrightText: 2026 Dominik Wadowski
// SPDX-License-Identifier: FSL-1.1-ALv2

import type { FamilyPool, FamilySummary } from "../types.js";
import { withFamilyTransaction } from "../infrastructure/with-family-transaction.js";
import { setUserContext } from "../infrastructure/set-user-context.js";

export const listMyFamilies = async (
  pool: FamilyPool,
  viewerUserId: string,
): Promise<FamilySummary[]> =>
  withFamilyTransaction(pool, async (client) => {
    await setUserContext(client, viewerUserId);
    const { rows } = await client.query<{ family_id: string; name: string }>(
      `SELECT f.family_id, f.name
         FROM family.family f
         JOIN family.family_member m ON m.family_id = f.family_id
        WHERE m.user_id = $1
        ORDER BY f.name, f.family_id`,
      [viewerUserId],
    );
    return rows.map((row) => ({ id: row.family_id, name: row.name }));
  });
