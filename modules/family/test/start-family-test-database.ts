// SPDX-FileCopyrightText: 2026 Dominik Wadowski
// SPDX-License-Identifier: FSL-1.1-ALv2

import { createModuleDb, migrateDeploy } from "@offgrid/db";
import { startTestDatabase } from "@offgrid/test-db";
import { RESET_SQL } from "./constants.js";
import type { FamilyTestDatabase } from "./types.js";

export const startFamilyTestDatabase = async (): Promise<FamilyTestDatabase> => {
  const database = await startTestDatabase();
  await migrateDeploy(database.migratorTarget);
  const db = createModuleDb(database.connect());
  return {
    admin: database.admin,
    pool: database.connect(),
    db,
    reset: async () => {
      await database.admin.query(RESET_SQL);
    },
    stop: async () => {
      await db.$disconnect();
      await database.stop();
    },
  };
};
