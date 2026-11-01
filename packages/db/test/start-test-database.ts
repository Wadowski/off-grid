// SPDX-FileCopyrightText: 2026 Dominik Wadowski
// SPDX-License-Identifier: FSL-1.1-ALv2

import { Client } from "pg";
import { startTestDatabase as startSharedTestDatabase } from "@offgrid/test-db";
import { migrateDeploy } from "../src/index.js";
import type { TestDatabase } from "./types.js";

export const startTestDatabase = async (options = { migrate: true }): Promise<TestDatabase> => {
  const shared = await startSharedTestDatabase();
  if (options.migrate) {
    await migrateDeploy(shared.migratorTarget);
  }
  const migrator = new Client(shared.migratorTarget);
  await migrator.connect();
  return {
    admin: shared.admin,
    migrator,
    migratorTarget: shared.migratorTarget,
    target: shared.target,
    connectClient: () => shared.connectClient(),
    connectPool: () => shared.connect(),
    stop: async () => {
      await migrator.end();
      await shared.stop();
    },
  };
};
