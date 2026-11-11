// SPDX-FileCopyrightText: 2026 Dominik Wadowski
// SPDX-License-Identifier: FSL-1.1-ALv2

import { createModuleDb, migrateDeploy } from "@offgrid/db";
import { startMigratedTestDatabase } from "@offgrid/test-db";
import { RESET_SQL } from "./constants.js";
import type { CalendarTestDatabase } from "./types.js";

export const startCalendarTestDatabase = async (): Promise<CalendarTestDatabase> => {
  const database = await startMigratedTestDatabase({ migrate: migrateDeploy, resetSql: RESET_SQL });
  const db = createModuleDb(database.connect());
  return {
    admin: database.admin,
    pool: database.connect(),
    db,
    reset: database.reset,
    stop: async () => {
      await db.$disconnect();
      await database.stop();
    },
  };
};
