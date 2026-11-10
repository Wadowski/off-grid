// SPDX-FileCopyrightText: 2026 Dominik Wadowski
// SPDX-License-Identifier: FSL-1.1-ALv2

import { startTestDatabase } from "./start-test-database.js";
import type { MigratedTestDatabase, MigratedTestDatabaseOptions } from "./types.js";

export const startMigratedTestDatabase = async ({
  migrate,
  resetSql,
}: MigratedTestDatabaseOptions): Promise<MigratedTestDatabase> => {
  const database = await startTestDatabase();
  await migrate(database.migratorTarget);
  return {
    admin: database.admin,
    connect: () => database.connect(),
    reset: async () => {
      await database.admin.query(resetSql);
    },
    stop: () => database.stop(),
  };
};
