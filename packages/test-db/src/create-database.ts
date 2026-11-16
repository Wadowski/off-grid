// SPDX-FileCopyrightText: 2026 Dominik Wadowski
// SPDX-License-Identifier: FSL-1.1-ALv2

import { assertIsolatedDatabaseName } from "./assert-isolated-database-name.js";
import { openAdminClient } from "./open-admin-client.js";
import type { SharedClusterConnection } from "./types.js";

export const createDatabase = async (
  connection: SharedClusterConnection,
  name: string,
): Promise<void> => {
  assertIsolatedDatabaseName(name);
  const maintenance = await openAdminClient(connection, connection.maintenanceDatabase);
  try {
    await maintenance.query(`CREATE DATABASE "${name}"`);
  } finally {
    await maintenance.end();
  }
};
