// SPDX-FileCopyrightText: 2026 Dominik Wadowski
// SPDX-License-Identifier: FSL-1.1-ALv2

import type { ServerRuntime, CheckStatus, AppliedMigrationRow } from "./types.js";
import type { Migration } from "@offgrid/db";
import { migrationKey } from "./migration-key.js";
import { logCheckFailure } from "./log-check-failure.js";

export const migrationsCheck = async (
  runtime: ServerRuntime,
  expectedMigrations: readonly Migration[],
): Promise<CheckStatus> => {
  if (expectedMigrations.length === 0) {
    return "ok";
  }
  try {
    const { rows } = await runtime.pool.query<AppliedMigrationRow>(
      "SELECT module, name, checksum FROM public.schema_migrations",
    );
    const applied = new Set(rows.map((row) => migrationKey(row.module, row.name, row.checksum)));
    const allApplied = expectedMigrations.every((migration) =>
      applied.has(migrationKey(migration.schema, migration.name, migration.checksum)),
    );
    return allApplied ? "ok" : "pending";
  } catch (error) {
    logCheckFailure(runtime, "migrations", error);
    return "unavailable";
  }
};
