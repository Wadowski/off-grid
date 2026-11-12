// SPDX-FileCopyrightText: 2026 Dominik Wadowski
// SPDX-License-Identifier: FSL-1.1-ALv2

import { rawSqlExecutor, type ModuleTransaction } from "@offgrid/db";

export const bumpMembershipVersion = async (
  tx: ModuleTransaction,
  familyId: string,
  userId: string,
): Promise<number> => {
  const { rows } = await rawSqlExecutor(tx).query<{ source_version: number }>(
    `INSERT INTO family.membership_version (family_id, user_id, source_version)
     VALUES ($1, $2, 1)
     ON CONFLICT (family_id, user_id)
     DO UPDATE SET source_version = family.membership_version.source_version + 1
     RETURNING source_version`,
    [familyId, userId],
  );
  const row = rows[0];
  if (row === undefined) {
    throw new Error("membership version was not returned");
  }
  return row.source_version;
};
