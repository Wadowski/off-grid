// SPDX-FileCopyrightText: 2026 Dominik Wadowski
// SPDX-License-Identifier: FSL-1.1-ALv2

import { assertOwnershipScopes, DATABASE_SCHEMAS, MIGRATOR_ROLE, migrateDeploy } from "@offgrid/db";
import { Client } from "pg";
import { CONNECTION_TIMEOUT_MS } from "./constants.js";
import { loadConfig } from "./load-config.js";

export const migrateDatabase = async (): Promise<void> => {
  const { database } = loadConfig();
  if (database.user !== MIGRATOR_ROLE) {
    throw new Error(`migrations must run as ${MIGRATOR_ROLE}, not the runtime login`);
  }
  const target = {
    host: database.host,
    port: database.port,
    database: database.name,
    user: database.user,
    password: database.password,
  };
  const output = await migrateDeploy(target);
  const client = new Client({ ...target, connectionTimeoutMillis: CONNECTION_TIMEOUT_MS });
  try {
    await client.connect();
    await assertOwnershipScopes(client, DATABASE_SCHEMAS);
  } finally {
    await client.end().catch(() => undefined);
  }
  process.stdout.write(output);
};
