// SPDX-FileCopyrightText: 2026 Dominik Wadowski
// SPDX-License-Identifier: FSL-1.1-ALv2

import type { TestDatabase } from "./types.js";
import { PostgreSqlContainer, type StartedPostgreSqlContainer } from "@testcontainers/postgresql";
import { Client } from "pg";
import { randomBytes } from "node:crypto";
import { runInitScripts } from "./run-init-scripts.js";
import { applyOutboxMigrations } from "./apply-outbox-migrations.js";

export const startTestDatabase = async (): Promise<TestDatabase> => {
  const container: StartedPostgreSqlContainer = await new PostgreSqlContainer(
    "postgres:16-alpine",
  ).start();
  const admin = new Client({ connectionString: container.getConnectionUri() });
  try {
    await admin.connect();
    const password = randomBytes(24).toString("hex");
    await runInitScripts(admin);
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
      stop: async () => {
        await admin.end();
        await container.stop();
      },
    };
  } catch (error) {
    await admin.end().catch(() => undefined);
    await container.stop();
    throw error;
  }
};
