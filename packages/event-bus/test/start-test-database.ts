// SPDX-FileCopyrightText: 2026 Dominik Wadowski
// SPDX-License-Identifier: FSL-1.1-ALv2

import type { TestDatabase, AppSchema } from "./types.js";
import { PostgreSqlContainer, type StartedPostgreSqlContainer } from "@testcontainers/postgresql";
import { Client, Pool } from "pg";
import { APP_SCHEMAS, INIT_SCRIPTS } from "./constants.js";
import { readFile } from "node:fs/promises";
import { secret } from "./secret.js";
import { provisionLogin } from "./provision-login.js";
import { applyMigrations } from "./apply-migrations.js";

export const startTestDatabase = async (): Promise<TestDatabase> => {
  const container: StartedPostgreSqlContainer = await new PostgreSqlContainer(
    "postgres:16-alpine",
  ).start();
  const admin = new Client({ connectionString: container.getConnectionUri() });
  await admin.connect();
  for (const script of INIT_SCRIPTS) {
    await admin.query(await readFile(new URL(script, import.meta.url), "utf8"));
  }

  const appPassword = secret();
  for (const schema of APP_SCHEMAS) {
    await provisionLogin(admin, `${schema}_app`, appPassword);
  }
  await applyMigrations(admin);

  const connection = (schema: AppSchema) => ({
    host: container.getHost(),
    port: container.getPort(),
    database: container.getDatabase(),
    user: `${schema}_app`,
    password: appPassword,
  });
  const pools: Pool[] = [];
  const clients: Client[] = [];
  return {
    admin,
    connect: (schema) => {
      const pool = new Pool({ ...connection(schema), max: 4 });
      pools.push(pool);
      return pool;
    },
    connectClient: async (schema) => {
      const client = new Client(connection(schema));
      await client.connect();
      clients.push(client);
      return client;
    },
    stop: async () => {
      await Promise.all(pools.map((pool) => pool.end()));
      await Promise.all(clients.map((client) => client.end()));
      await admin.end();
      await container.stop();
    },
  };
};
