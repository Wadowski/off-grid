// SPDX-FileCopyrightText: 2026 Dominik Wadowski
// SPDX-License-Identifier: FSL-1.1-ALv2

import type { ClientBase } from "pg";
import type { MigrationSource } from "./types.js";
import { LOCK_SQL, UNLOCK_SQL } from "./constants.js";
import { loadMigrations } from "./load-migrations.js";
import { MigrationChecksumError } from "./migration-checksum-error.js";
import { applyOne } from "./apply-one.js";

export const runMigrations = async (
  client: ClientBase,
  sources: readonly MigrationSource[],
): Promise<{ applied: string[] }> => {
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
};
