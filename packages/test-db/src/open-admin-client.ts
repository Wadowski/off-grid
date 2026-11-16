// SPDX-FileCopyrightText: 2026 Dominik Wadowski
// SPDX-License-Identifier: FSL-1.1-ALv2

import { Client } from "pg";
import type { SharedClusterConnection } from "./types.js";

export const openAdminClient = async (
  connection: SharedClusterConnection,
  database: string,
): Promise<Client> => {
  const client = new Client({
    host: connection.host,
    port: connection.port,
    user: connection.adminUser,
    password: connection.adminPassword,
    database,
  });
  await client.connect();
  return client;
};
