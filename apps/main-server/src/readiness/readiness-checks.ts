// SPDX-FileCopyrightText: 2026 Dominik Wadowski
// SPDX-License-Identifier: FSL-1.1-ALv2

import type { ServerRuntime, ReadinessChecks } from "../types.js";
import type { Migration } from "@offgrid/db";
import { databaseCheck } from "./database-check.js";
import { migrationsCheck } from "./migrations-check.js";

export const readinessChecks = async (
  runtime: ServerRuntime,
  expectedMigrations: readonly Migration[],
): Promise<ReadinessChecks> => {
  return {
    database: await databaseCheck(runtime),
    publisher: runtime.state.publisherRunning && !runtime.state.draining ? "ok" : "stopped",
    migrations: await migrationsCheck(runtime, expectedMigrations),
  };
};
