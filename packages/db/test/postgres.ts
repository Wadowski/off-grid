// SPDX-FileCopyrightText: 2026 Dominik Wadowski
// SPDX-License-Identifier: FSL-1.1-ALv2

import { randomBytes } from "node:crypto";
import { readFile } from "node:fs/promises";
import { fileURLToPath } from "node:url";
import { PostgreSqlContainer, type StartedPostgreSqlContainer } from "@testcontainers/postgresql";
import { Client } from "pg";
import {
  MIGRATOR_ROLE,
  appRoleOf,
  provisionLoginRole,
  type DatabaseSchema,
  type DatabaseTarget,
  type MigrationSource,
} from "../src/index.js";

const INIT_SCRIPTS = [
  "../../../infra/init/sql/01-roles-and-schemas.sql",
  "../../../infra/init/sql/02-scope-helpers.sql",
];

export const FIXTURES = fileURLToPath(new URL("./fixtures/migrations", import.meta.url));

/** Migrations used by the tests: every fixture module, in dependency order. */
export function fixtureSources(): MigrationSource[] {
  return (["food", "family", "access", "lists"] as const satisfies DatabaseSchema[]).map(
    (schema) => ({ schema, directory: `${FIXTURES}/${schema}` }),
  );
}

export interface TestDatabase {
  admin: Client;
  migrator: Client;
  /** Connects as the runtime role of `schema` (password is shared across app roles in tests). */
  connect(schema: DatabaseSchema): Promise<Client>;
  target: DatabaseTarget;
  stop(): Promise<void>;
}

function secret(): string {
  return randomBytes(24).toString("hex");
}

/**
 * Starts a real Postgres container, applies the init SQL, provisions login
 * passwords for the migrator and every app role, and returns clients for them.
 * Nothing here is shared between test files.
 */
export async function startTestDatabase(): Promise<TestDatabase> {
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
    async connect(schema) {
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
    async stop() {
      await migrator.end();
      await superuser.end();
      await container.stop();
    },
  };
}
