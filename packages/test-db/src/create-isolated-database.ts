// SPDX-FileCopyrightText: 2026 Dominik Wadowski
// SPDX-License-Identifier: FSL-1.1-ALv2

import { randomBytes } from "node:crypto";
import { ISOLATED_DATABASE_PREFIX } from "./constants.js";
import { dropIsolatedDatabase } from "./drop-isolated-database.js";
import { createDatabase } from "./create-database.js";
import { openAdminClient } from "./open-admin-client.js";
import { runInitScripts } from "./run-init-scripts.js";
import type { IsolatedDatabase, SharedClusterConnection } from "./types.js";

export const createIsolatedDatabase = async (
  connection: SharedClusterConnection,
): Promise<IsolatedDatabase> => {
  const name = `${ISOLATED_DATABASE_PREFIX}${randomBytes(12).toString("hex")}`;
  await createDatabase(connection, name);
  const admin = await openAdminClient(connection, name);
  try {
    await runInitScripts(admin);
  } catch (error) {
    await admin.end();
    await dropIsolatedDatabase(connection, name);
    throw error;
  }
  return { name, admin };
};
