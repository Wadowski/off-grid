// SPDX-FileCopyrightText: 2026 Dominik Wadowski
// SPDX-License-Identifier: FSL-1.1-ALv2

import { runMigrations } from "@offgrid/db";
import { Client } from "pg";
import { CONNECTION_TIMEOUT_MS, MODULES } from "./constants.js";
import { loadConfig } from "./load-config.js";

export const migrateDatabase = async (): Promise<void> => {
  const { database } = loadConfig();
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
    const sources = MODULES.flatMap((module) => module.migrations ?? []);
    const { applied } = await runMigrations(client, sources);
    process.stdout.write(`applied ${applied.length} migration(s)\n`);
  } finally {
    await client.end().catch(() => undefined);
  }
};
