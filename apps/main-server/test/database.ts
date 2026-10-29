// SPDX-FileCopyrightText: 2026 Dominik Wadowski
// SPDX-License-Identifier: FSL-1.1-ALv2

import { randomBytes } from "node:crypto";
import { readFile, readdir } from "node:fs/promises";
import { fileURLToPath } from "node:url";
import { PostgreSqlContainer, type StartedPostgreSqlContainer } from "@testcontainers/postgresql";
import { Client } from "pg";
import type { TestDatabase } from "./types.js";

const INIT_SCRIPTS = [
  "../../../infra/init/sql/01-roles-and-schemas.sql",
  "../../../infra/init/sql/02-scope-helpers.sql",
  "../../../infra/init/sql/03-bus-membership.sql",
];

const OUTBOX_MIGRATIONS = fileURLToPath(
  new URL("../../../packages/event-bus/migrations", import.meta.url),
);

export async function startTestDatabase(): Promise<TestDatabase> {
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
  await applyOutboxMigrations(admin);

  return {
    connection: {
      host: container.getHost(),
      port: container.getPort(),
      name: container.getDatabase(),
      user: "outbox_app",
      password,
      poolMax: 5,
    },
    async stop() {
      await admin.end();
      await container.stop();
    },
  };
}

async function applyOutboxMigrations(admin: Client): Promise<void> {
  const names = (await readdir(OUTBOX_MIGRATIONS)).filter((name) => name.endsWith(".sql")).sort();
  for (const name of names) {
    const sql = await readFile(`${OUTBOX_MIGRATIONS}/${name}`, "utf8");
    await admin.query("BEGIN");
    await admin.query('SET LOCAL ROLE "outbox_owner"');
    await admin.query(sql);
    await admin.query("COMMIT");
  }
}
