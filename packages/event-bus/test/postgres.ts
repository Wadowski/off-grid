// SPDX-FileCopyrightText: 2026 Dominik Wadowski
// SPDX-License-Identifier: FSL-1.1-ALv2

import { randomBytes } from "node:crypto";
import { readFile, readdir } from "node:fs/promises";
import { fileURLToPath } from "node:url";
import { PostgreSqlContainer, type StartedPostgreSqlContainer } from "@testcontainers/postgresql";
import { Client, Pool } from "pg";
import type { AppSchema, TestDatabase } from "./types.js";

const INIT_SCRIPTS = [
  "../../../infra/init/sql/01-roles-and-schemas.sql",
  "../../../infra/init/sql/02-scope-helpers.sql",
  "../../../infra/init/sql/03-bus-membership.sql",
];

const MIGRATION_DIRECTORIES = [
  { schema: "outbox", directory: fileURLToPath(new URL("../migrations", import.meta.url)) },
  {
    schema: "family",
    directory: fileURLToPath(new URL("./fixtures/family", import.meta.url)),
  },
] as const;

const APP_SCHEMAS = ["outbox", "family"] as const;

function secret(): string {
  return randomBytes(24).toString("hex");
}

async function provisionLogin(admin: Client, role: string, password: string): Promise<void> {
  await admin.query(`ALTER ROLE "${role}" LOGIN PASSWORD ${admin.escapeLiteral(password)}`);
}

async function applyMigrations(admin: Client): Promise<void> {
  for (const { schema, directory } of MIGRATION_DIRECTORIES) {
    const names = (await readdir(directory)).filter((name) => name.endsWith(".sql")).sort();
    for (const name of names) {
      const sql = await readFile(`${directory}/${name}`, "utf8");
      await admin.query("BEGIN");
      await admin.query(`SET LOCAL ROLE "${schema}_owner"`);
      await admin.query(sql);
      await admin.query("COMMIT");
    }
  }
}

export async function startTestDatabase(): Promise<TestDatabase> {
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
    connect(schema) {
      const pool = new Pool({ ...connection(schema), max: 4 });
      pools.push(pool);
      return pool;
    },
    async connectClient(schema) {
      const client = new Client(connection(schema));
      await client.connect();
      clients.push(client);
      return client;
    },
    async stop() {
      await Promise.all(pools.map((pool) => pool.end()));
      await Promise.all(clients.map((client) => client.end()));
      await admin.end();
      await container.stop();
    },
  };
}
