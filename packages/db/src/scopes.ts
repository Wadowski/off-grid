// SPDX-FileCopyrightText: 2026 Dominik Wadowski
// SPDX-License-Identifier: FSL-1.1-ALv2

import type { ClientBase } from "pg";
import type { DatabaseSchema } from "./schemas.js";

export const OWNERSHIP_SCOPES = ["family-or-user", "family", "user", "shared"] as const;
export type OwnershipScope = (typeof OWNERSHIP_SCOPES)[number];

const SCOPE_COMMENT = /^offgrid:scope=(.+)$/;

interface TableRow {
  schema: string;
  table: string;
  comment: string | null;
  rls: boolean;
  has_family: boolean;
  has_user: boolean;
}

/** Returns a description of each table that breaks its declared ownership scope. */
export function scopeViolation(row: Omit<TableRow, "schema">): string | null {
  const match = row.comment?.match(SCOPE_COMMENT);
  if (!match) {
    return "no ownership scope declared (call public.offgrid_declare_scope)";
  }
  const scope = match[1] ?? "";
  if (!(OWNERSHIP_SCOPES as readonly string[]).includes(scope)) {
    return `unknown ownership scope "${scope}"`;
  }
  if (scope === "shared") {
    return row.has_family || row.has_user ? "shared table has an owner column" : null;
  }
  if (!row.rls) {
    return `scope ${scope} requires row level security`;
  }
  const needsFamily = scope === "family" || scope === "family-or-user";
  const needsUser = scope === "user" || scope === "family-or-user";
  if (needsFamily && !row.has_family) return `scope ${scope} requires family_id`;
  if (needsUser && !row.has_user) return `scope ${scope} requires user_id`;
  return null;
}

/**
 * Checks that every table in the given schemas declares an ownership scope that
 * matches its columns and row-level security (ADR 0009). Throws listing every
 * violation. Run it in CI and in the integration tests after migrations.
 */
export async function assertOwnershipScopes(
  client: ClientBase,
  schemas: readonly DatabaseSchema[],
): Promise<void> {
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
}
