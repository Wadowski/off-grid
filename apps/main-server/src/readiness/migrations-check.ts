// SPDX-FileCopyrightText: 2026 Dominik Wadowski
// SPDX-License-Identifier: FSL-1.1-ALv2

import type { ServerRuntime, CheckStatus, AppliedMigrationRow } from "../types.js";
import type { Migration } from "@offgrid/db";
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
      "SELECT migration_name, checksum FROM public._prisma_migrations WHERE finished_at IS NOT NULL",
    );
    const applied = new Map(rows.map((row) => [row.migration_name, row.checksum]));
    const allApplied = expectedMigrations.every(
      (migration) => applied.get(migration.name) === migration.checksum,
    );
    return allApplied ? "ok" : "pending";
  } catch (error) {
    logCheckFailure(runtime, "migrations", error);
    return "unavailable";
  }
};
