// SPDX-FileCopyrightText: 2026 Dominik Wadowski
// SPDX-License-Identifier: FSL-1.1-ALv2

import { startTestDatabase as startSharedTestDatabase } from "@offgrid/test-db";
import type { TestDatabase } from "./types.js";

export const startTestDatabase = async (): Promise<TestDatabase> => {
  const shared = await startSharedTestDatabase();
  return {
    connection: {
      host: shared.target.host,
      port: shared.target.port,
      name: shared.target.database,
      user: shared.target.user,
      password: shared.target.password,
      poolMax: 5,
    },
    migratorTarget: shared.migratorTarget,
    stop: shared.stop,
  };
};
