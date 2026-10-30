// SPDX-FileCopyrightText: 2026 Dominik Wadowski
// SPDX-License-Identifier: FSL-1.1-ALv2

import { startTestDatabase as startSharedTestDatabase } from "@offgrid/test-db";
import { FAMILY_MIGRATION_DIRECTORY } from "./family-migration-directory.js";
import { OUTBOX_MIGRATIONS } from "./outbox-migrations.js";
import type { TestDatabase } from "./types.js";

export const startTestDatabase = async (): Promise<TestDatabase> => {
  const database = await startSharedTestDatabase({
    schemas: ["outbox", "family"],
    migrations: [
      { schema: "outbox", directory: OUTBOX_MIGRATIONS },
      { schema: "family", directory: FAMILY_MIGRATION_DIRECTORY },
    ],
  });
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
