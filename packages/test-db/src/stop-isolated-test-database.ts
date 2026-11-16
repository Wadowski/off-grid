// SPDX-FileCopyrightText: 2026 Dominik Wadowski
// SPDX-License-Identifier: FSL-1.1-ALv2

import type { Client, Pool } from "pg";
import { dropIsolatedDatabase } from "./drop-isolated-database.js";
import type { SharedClusterConnection } from "./types.js";

export const stopIsolatedTestDatabase = async (
  connection: SharedClusterConnection,
  name: string,
  admin: Client,
  pools: readonly Pool[],
  clients: readonly Client[],
): Promise<void> => {
  await Promise.all([...pools.map((pool) => pool.end()), ...clients.map((client) => client.end())]);
  await admin.end();
  await dropIsolatedDatabase(connection, name);
};
