// SPDX-FileCopyrightText: 2026 Dominik Wadowski
// SPDX-License-Identifier: FSL-1.1-ALv2

import type { StartedPostgreSqlContainer } from "@testcontainers/postgresql";
import type { Client, Pool } from "pg";

export const stopTestDatabase = async (
  admin: Client,
  container: StartedPostgreSqlContainer,
  pools: readonly Pool[],
  clients: readonly Client[],
): Promise<void> => {
  await Promise.all([...pools.map((pool) => pool.end()), ...clients.map((client) => client.end())]);
  await admin.end();
  await container.stop();
};
