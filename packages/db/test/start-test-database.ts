// SPDX-FileCopyrightText: 2026 Dominik Wadowski
// SPDX-License-Identifier: FSL-1.1-ALv2

import { randomBytes } from "node:crypto";
import { Client } from "pg";
import { startTestDatabase as startSharedTestDatabase } from "@offgrid/test-db";
import { DATABASE_SCHEMAS, MIGRATOR_ROLE, provisionLoginRole } from "../src/index.js";
import type { TestDatabase } from "./types.js";

export const startTestDatabase = async (): Promise<TestDatabase> => {
  const shared = await startSharedTestDatabase({ schemas: DATABASE_SCHEMAS, migrations: [] });
  const migratorPassword = randomBytes(24).toString("hex");
  await provisionLoginRole(shared.admin, MIGRATOR_ROLE, migratorPassword);
  const migrator = new Client({
    host: shared.target.host,
    port: shared.target.port,
    database: shared.target.database,
    user: MIGRATOR_ROLE,
    password: migratorPassword,
  });
  await migrator.connect();
  return {
    admin: shared.admin,
    migrator,
    target: shared.target,
    connect: (schema) => shared.connectClient(schema),
    connectPool: (schema) => shared.connect(schema),
    stop: async () => {
      await migrator.end();
      await shared.stop();
    },
  };
};
