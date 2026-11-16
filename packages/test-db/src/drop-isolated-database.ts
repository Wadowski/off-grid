// SPDX-FileCopyrightText: 2026 Dominik Wadowski
// SPDX-License-Identifier: FSL-1.1-ALv2

import { openAdminClient } from "./open-admin-client.js";
import type { SharedClusterConnection } from "./types.js";

export const dropIsolatedDatabase = async (
  connection: SharedClusterConnection,
  name: string,
): Promise<void> => {
  const maintenance = await openAdminClient(connection, connection.maintenanceDatabase);
  try {
    await maintenance.query(`DROP DATABASE IF EXISTS "${name}" WITH (FORCE)`);
  } finally {
    await maintenance.end();
  }
};
