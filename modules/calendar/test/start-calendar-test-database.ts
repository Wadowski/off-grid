// SPDX-FileCopyrightText: 2026 Dominik Wadowski
// SPDX-License-Identifier: FSL-1.1-ALv2

import { migrateDeploy } from "@offgrid/db";
import { startTestDatabase } from "@offgrid/test-db";
import type { Client, Pool } from "pg";
import { RESET_SQL } from "./constants.js";

export interface CalendarTestDatabase {
  readonly admin: Client;
  readonly pool: Pool;
  reset(): Promise<void>;
  stop(): Promise<void>;
}

export const startCalendarTestDatabase = async (): Promise<CalendarTestDatabase> => {
  const database = await startTestDatabase();
  await migrateDeploy(database.migratorTarget);
  const pool = database.connect();
  return {
    admin: database.admin,
    pool,
    reset: async () => {
      await database.admin.query(RESET_SQL);
    },
    stop: database.stop,
  };
};
