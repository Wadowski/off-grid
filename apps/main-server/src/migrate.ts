// SPDX-FileCopyrightText: 2026 Dominik Wadowski
// SPDX-License-Identifier: FSL-1.1-ALv2

import { runMigrations } from "@offgrid/db";
import { Client } from "pg";
import { loadConfig } from "./config.js";
import { MODULES } from "./module-list.js";

const failMigration = (error: unknown): never => {
  process.stderr.write(`${error instanceof Error ? error.message : "migration failed"}\n`);
  process.exit(1);
};

async function migrate(): Promise<void> {
  const { database } = loadConfig();
  const client = new Client({
    host: database.host,
    port: database.port,
    database: database.name,
    user: database.user,
    password: database.password,
  });
  await client.connect();
  try {
    const sources = MODULES.flatMap((module) => module.migrations ?? []);
    const { applied } = await runMigrations(client, sources);
    process.stdout.write(`applied ${applied.length} migration(s)\n`);
  } finally {
    await client.end();
  }
}

await migrate().catch(failMigration);
