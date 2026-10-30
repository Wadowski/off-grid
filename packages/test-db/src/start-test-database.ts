// SPDX-FileCopyrightText: 2026 Dominik Wadowski
// SPDX-License-Identifier: FSL-1.1-ALv2

import { PostgreSqlContainer, type StartedPostgreSqlContainer } from "@testcontainers/postgresql";
import { Client, Pool } from "pg";
import { appRoleOf, createModuleDb, type DatabaseSchema, type DatabaseTarget } from "@offgrid/db";
import { applyMigrations } from "./apply-migrations.js";
import { CONTAINER_IMAGE, POOL_MAX } from "./constants.js";
import { provisionLogin } from "./provision-login.js";
import { runInitScripts } from "./run-init-scripts.js";
import { secret } from "./secret.js";
import type { StartOptions, TestDatabase } from "./types.js";

export const startTestDatabase = async ({
  schemas,
  migrations,
}: StartOptions): Promise<TestDatabase> => {
  const container: StartedPostgreSqlContainer = await new PostgreSqlContainer(
    CONTAINER_IMAGE,
  ).start();
  const admin = new Client({ connectionString: container.getConnectionUri() });
  const password = secret();
  try {
    await admin.connect();
    await runInitScripts(admin);
    for (const schema of schemas) {
      await provisionLogin(admin, schema, password);
    }
    for (const migration of migrations) {
      await applyMigrations(admin, migration.schema, migration.directory);
    }
  } catch (error) {
    await admin.end().catch(() => undefined);
    await container.stop();
    throw error;
  }

  const target: DatabaseTarget = {
    host: container.getHost(),
    port: container.getPort(),
    database: container.getDatabase(),
    password,
  };
  const pools: Pool[] = [];
  const clients: Client[] = [];
  const moduleDatabases: ReturnType<typeof createModuleDb>[] = [];
  const connectionFor = (schema: DatabaseSchema) => ({
    host: target.host,
    port: target.port,
    database: target.database,
    user: appRoleOf(schema),
    password,
  });

  return {
    admin,
    target,
    connect: (schema) => {
      const pool = new Pool({ ...connectionFor(schema), max: POOL_MAX });
      pools.push(pool);
      return pool;
    },
    connectClient: async (schema) => {
      const client = new Client(connectionFor(schema));
      await client.connect();
      clients.push(client);
      return client;
    },
    moduleDb: (schema) => {
      const db = createModuleDb(target, schema);
      moduleDatabases.push(db);
      return db;
    },
    stop: async () => {
      await Promise.all([
        ...pools.map((pool) => pool.end()),
        ...clients.map((client) => client.end()),
        ...moduleDatabases.map((db) => db.$disconnect()),
      ]);
      await admin.end();
      await container.stop();
    },
  };
};
