// SPDX-FileCopyrightText: 2026 Dominik Wadowski
// SPDX-License-Identifier: FSL-1.1-ALv2

import { assertOwnershipScopes, DATABASE_SCHEMAS, MIGRATOR_ROLE, runMigrations } from "@offgrid/db";
import { Client } from "pg";
import { CONNECTION_TIMEOUT_MS, MODULES } from "./constants.js";
import { allMigrationSources } from "./all-migration-sources.js";
import { loadConfig } from "./load-config.js";

export const migrateDatabase = async (): Promise<void> => {
  const { database } = loadConfig();
  if (database.user !== MIGRATOR_ROLE) {
    throw new Error(`migrations must run as ${MIGRATOR_ROLE}, not the runtime login`);
  }
  const client = new Client({
    host: database.host,
    port: database.port,
    database: database.name,
    user: database.user,
    password: database.password,
    connectionTimeoutMillis: CONNECTION_TIMEOUT_MS,
  });
  try {
    await client.connect();
    const sources = allMigrationSources(MODULES);
    const { applied } = await runMigrations(client, sources);
    await assertOwnershipScopes(client, DATABASE_SCHEMAS);
    process.stdout.write(`applied ${applied.length} migration(s)\n`);
  } finally {
    await client.end().catch(() => undefined);
  }
};
