// SPDX-FileCopyrightText: 2026 Dominik Wadowski
// SPDX-License-Identifier: FSL-1.1-ALv2

import type { ClientBase } from "pg";
import type { DatabaseSchema, TableRow } from "./types.js";
import { scopeViolation } from "./scope-violation.js";

export const assertOwnershipScopes = async (
  client: ClientBase,
  schemas: readonly DatabaseSchema[],
): Promise<void> => {
  const { rows } = await client.query<TableRow>(
    `SELECT n.nspname AS schema,
            c.relname AS table,
            obj_description(c.oid, 'pg_class') AS comment,
            c.relrowsecurity AS rls,
            EXISTS (SELECT 1 FROM pg_attribute a
                     WHERE a.attrelid = c.oid AND a.attname = 'family_id'
                       AND NOT a.attisdropped) AS has_family,
            EXISTS (SELECT 1 FROM pg_attribute a
                     WHERE a.attrelid = c.oid AND a.attname = 'user_id'
                       AND NOT a.attisdropped) AS has_user
       FROM pg_class c
       JOIN pg_namespace n ON n.oid = c.relnamespace
      WHERE c.relkind IN ('r', 'p') AND n.nspname = ANY($1)
      ORDER BY n.nspname, c.relname`,
    [schemas],
  );

  const violations = rows.flatMap((row) => {
    const reason = scopeViolation(row);
    return reason ? [`${row.schema}.${row.table}: ${reason}`] : [];
  });
  if (violations.length > 0) {
    throw new Error(`ownership scope violations:\n${violations.join("\n")}`);
  }
};
