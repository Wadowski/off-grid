// SPDX-FileCopyrightText: 2026 Dominik Wadowski
// SPDX-License-Identifier: FSL-1.1-ALv2

import { randomBytes } from "node:crypto";
import { readFile, readdir } from "node:fs/promises";
import { fileURLToPath } from "node:url";
import { PostgreSqlContainer, type StartedPostgreSqlContainer } from "@testcontainers/postgresql";
import { Client, Pool } from "pg";

const INIT_SCRIPTS = [
  "../../../infra/init/sql/01-roles-and-schemas.sql",
  "../../../infra/init/sql/02-scope-helpers.sql",
  "../../../infra/init/sql/03-bus-membership.sql",
];

const MIGRATION_DIRECTORIES = [
  {
    schema: "outbox",
    directory: fileURLToPath(new URL("../../../packages/event-bus/migrations", import.meta.url)),
  },
  {
    schema: "family",
    directory: fileURLToPath(new URL("../src/infrastructure/migrations", import.meta.url)),
  },
] as const;

export const RESET_SQL = `TRUNCATE outbox.event, outbox.subscriber_cursor, outbox.dead_letter,
  family.family_summary, family.family_member, family.family RESTART IDENTITY CASCADE`;

export interface FamilyTestDatabase {
  readonly admin: Client;
  readonly pool: Pool;
  reset(): Promise<void>;
  stop(): Promise<void>;
}

export async function startFamilyTestDatabase(): Promise<FamilyTestDatabase> {
  const container: StartedPostgreSqlContainer = await new PostgreSqlContainer(
    "postgres:16-alpine",
  ).start();
  const admin = new Client({ connectionString: container.getConnectionUri() });
  await admin.connect();
  for (const script of INIT_SCRIPTS) {
    await admin.query(await readFile(new URL(script, import.meta.url), "utf8"));
  }

  const password = randomBytes(24).toString("hex");
  await admin.query(`ALTER ROLE outbox_app LOGIN PASSWORD ${admin.escapeLiteral(password)}`);
  for (const { schema, directory } of MIGRATION_DIRECTORIES) {
    await applyMigrations(admin, schema, directory);
  }

  const pool = new Pool({
    host: container.getHost(),
    port: container.getPort(),
    database: container.getDatabase(),
    user: "outbox_app",
    password,
    max: 4,
  });

  return {
    admin,
    pool,
    async reset() {
      await admin.query(RESET_SQL);
    },
    async stop() {
      await pool.end();
      await admin.end();
      await container.stop();
    },
  };
}

async function applyMigrations(admin: Client, schema: string, directory: string): Promise<void> {
  const names = (await readdir(directory)).filter((name) => name.endsWith(".sql")).sort();
  for (const name of names) {
    const sql = await readFile(`${directory}/${name}`, "utf8");
    await admin.query("BEGIN");
    try {
      await admin.query(`SET LOCAL ROLE "${schema}_owner"`);
      await admin.query(sql);
      await admin.query("COMMIT");
    } catch (error) {
      await admin.query("ROLLBACK");
      throw error;
    }
  }
}
