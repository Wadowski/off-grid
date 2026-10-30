// SPDX-FileCopyrightText: 2026 Dominik Wadowski
// SPDX-License-Identifier: FSL-1.1-ALv2

import type { TestDatabase } from "./types.js";
import { PostgreSqlContainer, type StartedPostgreSqlContainer } from "@testcontainers/postgresql";
import { Client } from "pg";
import { INIT_SCRIPTS } from "./constants.js";
import { readFile } from "node:fs/promises";
import { secret } from "./secret.js";
import { appRoleOf, type DatabaseTarget, MIGRATOR_ROLE, provisionLoginRole } from "../src/index.js";

export const startTestDatabase = async (): Promise<TestDatabase> => {
  const container: StartedPostgreSqlContainer = await new PostgreSqlContainer(
    "postgres:16-alpine",
  ).start();
  const superuser = new Client({ connectionString: container.getConnectionUri() });
  await superuser.connect();

  for (const script of INIT_SCRIPTS) {
    await superuser.query(await readFile(new URL(script, import.meta.url), "utf8"));
  }

  const appPassword = secret();
  const migratorPassword = secret();
  await provisionLoginRole(superuser, MIGRATOR_ROLE, migratorPassword);
  const schemas = [
    "identity",
    "family",
    "access",
    "calendar",
    "lists",
    "notes",
    "files",
    "food",
    "relations",
    "notifications",
    "export",
    "outbox",
  ] as const;
  for (const schema of schemas) {
    await provisionLoginRole(superuser, appRoleOf(schema), appPassword);
  }

  const target: DatabaseTarget = {
    host: container.getHost(),
    port: container.getPort(),
    database: container.getDatabase(),
    password: appPassword,
  };

  const migrator = new Client({
    host: target.host,
    port: target.port,
    database: target.database,
    user: MIGRATOR_ROLE,
    password: migratorPassword,
  });
  await migrator.connect();

  return {
    admin: superuser,
    migrator,
    target,
    connect: async (schema) => {
      const client = new Client({
        host: target.host,
        port: target.port,
        database: target.database,
        user: appRoleOf(schema),
        password: appPassword,
      });
      await client.connect();
      return client;
    },
    stop: async () => {
      await migrator.end();
      await superuser.end();
      await container.stop();
    },
  };
};
