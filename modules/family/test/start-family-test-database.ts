// SPDX-FileCopyrightText: 2026 Dominik Wadowski
// SPDX-License-Identifier: FSL-1.1-ALv2

import { FamilyTestDatabase } from "./types.js";
import { PostgreSqlContainer, type StartedPostgreSqlContainer } from "@testcontainers/postgresql";
import { Client, Pool } from "pg";
import { INIT_SCRIPTS, RESET_SQL } from "./constants.js";
import { MIGRATION_DIRECTORIES } from "./migration-directories.js";
import { readFile } from "node:fs/promises";
import { randomBytes } from "node:crypto";
import { applyMigrations } from "./apply-migrations.js";

export const startFamilyTestDatabase = async (): Promise<FamilyTestDatabase> => {
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
    reset: async () => {
      await admin.query(RESET_SQL);
    },
    stop: async () => {
      await pool.end();
      await admin.end();
      await container.stop();
    },
  };
};
