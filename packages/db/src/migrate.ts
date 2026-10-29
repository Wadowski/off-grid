// SPDX-FileCopyrightText: 2026 Dominik Wadowski
// SPDX-License-Identifier: FSL-1.1-ALv2

import { createHash } from "node:crypto";
import { readFile, readdir } from "node:fs/promises";
import { join } from "node:path";
import type { ClientBase } from "pg";
import { type DatabaseSchema, ownerRoleOf } from "./schemas.js";
import { quoteIdent } from "./sql.js";

/** The migrations of one module, read from a directory of `NNNN_name.sql` files. */
export interface MigrationSource {
  schema: DatabaseSchema;
  directory: string;
}

export interface Migration {
  schema: DatabaseSchema;
  name: string;
  sql: string;
  checksum: string;
}

export class MigrationChecksumError extends Error {
  constructor(schema: DatabaseSchema, name: string) {
    super(
      `migration ${schema}/${name} was applied with different contents; add a new migration instead of editing it`,
    );
    this.name = "MigrationChecksumError";
  }
}

export class MigrationFailedError extends Error {
  constructor(schema: DatabaseSchema, name: string, cause: unknown) {
    super(`migration ${schema}/${name} failed and was rolled back`, { cause });
    this.name = "MigrationFailedError";
  }
}

const LOCK_SQL = "SELECT pg_advisory_lock(hashtext('offgrid_migrations'))";
const UNLOCK_SQL = "SELECT pg_advisory_unlock(hashtext('offgrid_migrations'))";

export function checksumOf(sql: string): string {
  return createHash("sha256").update(sql).digest("hex");
}

export async function loadMigrations(source: MigrationSource): Promise<Migration[]> {
  const names = (await readdir(source.directory)).filter((n) => n.endsWith(".sql")).sort();
  return Promise.all(
    names.map(async (name) => {
      const sql = await readFile(join(source.directory, name), "utf8");
      return { schema: source.schema, name, sql, checksum: checksumOf(sql) };
    }),
  );
}

/**
 * Applies pending migrations in the order the sources are given (callers pass
 * them in dependency order). Each migration runs as its module's owner role in
 * its own transaction, and its history row is written in the same transaction.
 *
 * `client` must be connected as the migrator role. Applied migrations are
 * skipped; an applied migration whose file changed is refused.
 */
export async function runMigrations(
  client: ClientBase,
  sources: readonly MigrationSource[],
): Promise<{ applied: string[] }> {
  const applied: string[] = [];
  await client.query(LOCK_SQL);
  try {
    for (const source of sources) {
      for (const migration of await loadMigrations(source)) {
        const { rows } = await client.query<{ checksum: string }>(
          "SELECT checksum FROM public.schema_migrations WHERE module = $1 AND name = $2",
          [migration.schema, migration.name],
        );
        const existing = rows[0];
        if (existing) {
          if (existing.checksum !== migration.checksum) {
            throw new MigrationChecksumError(migration.schema, migration.name);
          }
          continue;
        }
        await applyOne(client, migration);
        applied.push(`${migration.schema}/${migration.name}`);
      }
    }
  } finally {
    await client.query(UNLOCK_SQL);
  }
  return { applied };
}

async function applyOne(client: ClientBase, migration: Migration): Promise<void> {
  await client.query("BEGIN");
  try {
    await client.query(`SET LOCAL ROLE ${quoteIdent(ownerRoleOf(migration.schema))}`);
    await client.query(migration.sql);
    await client.query("RESET ROLE");
    await client.query(
      "INSERT INTO public.schema_migrations (module, name, checksum) VALUES ($1, $2, $3)",
      [migration.schema, migration.name, migration.checksum],
    );
    await client.query("COMMIT");
  } catch (cause) {
    await client.query("ROLLBACK");
    throw new MigrationFailedError(migration.schema, migration.name, cause);
  }
}
