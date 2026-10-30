// SPDX-FileCopyrightText: 2026 Dominik Wadowski
// SPDX-License-Identifier: FSL-1.1-ALv2

import { runMigrations } from "@offgrid/db";
import { startTestDatabase as startSharedTestDatabase } from "@offgrid/test-db";
import { EVENT_BUS_MIGRATIONS } from "../src/constants.js";
import type { TestDatabase } from "./types.js";

export const startTestDatabase = async (): Promise<TestDatabase> => {
  const database = await startSharedTestDatabase({ schemas: ["outbox", "family"], migrations: [] });
  await runMigrations(database.admin, EVENT_BUS_MIGRATIONS);
  return {
    connection: {
      host: database.target.host,
      port: database.target.port,
      name: database.target.database,
      user: "outbox_app",
      password: database.target.password,
      poolMax: 5,
    },
    stop: database.stop,
  };
};
