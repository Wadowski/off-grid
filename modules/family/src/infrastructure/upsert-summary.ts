// SPDX-FileCopyrightText: 2026 Dominik Wadowski
// SPDX-License-Identifier: FSL-1.1-ALv2

import type { ClientBase } from "pg";
import type { NewSummary } from "../types.js";

export const upsertSummary = async (client: ClientBase, summary: NewSummary): Promise<void> => {
  await client.query(
    `INSERT INTO family.family_summary (user_id, family_id, name, source_version)
     VALUES ($1, $2, $3, $4)
     ON CONFLICT (user_id, family_id) DO UPDATE
       SET name = EXCLUDED.name, source_version = EXCLUDED.source_version`,
    [summary.userId, summary.familyId, summary.name, summary.sourceVersion],
  );
};
