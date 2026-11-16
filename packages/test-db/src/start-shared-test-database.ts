// SPDX-FileCopyrightText: 2026 Dominik Wadowski
// SPDX-License-Identifier: FSL-1.1-ALv2

import type { Client, Pool } from "pg";
import { APP_ROLE_NAME, MIGRATOR_ROLE_NAME } from "./constants.js";
import { connectClient } from "./connect-client.js";
import { connectPool } from "./connect-pool.js";
import { createIsolatedDatabase } from "./create-isolated-database.js";
import { sharedTargetOf } from "./shared-target-of.js";
import { stopIsolatedTestDatabase } from "./stop-isolated-test-database.js";
import type { SharedClusterConnection, TestDatabase } from "./types.js";

export const startSharedTestDatabase = async (
  connection: SharedClusterConnection,
): Promise<TestDatabase> => {
  const { name, admin } = await createIsolatedDatabase(connection);
  const target = sharedTargetOf(connection, name, APP_ROLE_NAME, connection.appPassword);
  const migratorTarget = sharedTargetOf(
    connection,
    name,
    MIGRATOR_ROLE_NAME,
    connection.migratorPassword,
  );
  const pools: Pool[] = [];
  const clients: Client[] = [];
  return {
    admin,
    target,
    migratorTarget,
    connect: () => connectPool(target, pools),
    connectClient: () => connectClient(target, clients),
    stop: () => stopIsolatedTestDatabase(connection, name, admin, pools, clients),
  };
};
