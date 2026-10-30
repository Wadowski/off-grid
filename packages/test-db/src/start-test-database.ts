// SPDX-FileCopyrightText: 2026 Dominik Wadowski
// SPDX-License-Identifier: FSL-1.1-ALv2

import { PostgreSqlContainer, type StartedPostgreSqlContainer } from "@testcontainers/postgresql";
import { Client, type Pool } from "pg";
import { CONTAINER_IMAGE } from "./constants.js";
import { buildTarget } from "./build-target.js";
import { connectClient } from "./connect-client.js";
import { connectPool } from "./connect-pool.js";
import { provisionDatabase } from "./provision-database.js";
import { secret } from "./secret.js";
import { stopContainer } from "./stop-container.js";
import { stopTestDatabase } from "./stop-test-database.js";
import type { StartOptions, TestDatabase } from "./types.js";

export const startTestDatabase = async (options: StartOptions): Promise<TestDatabase> => {
  const container: StartedPostgreSqlContainer = await new PostgreSqlContainer(
    CONTAINER_IMAGE,
  ).start();
  const admin = new Client({ connectionString: container.getConnectionUri() });
  const password = secret();
  try {
    await admin.connect();
    await provisionDatabase(admin, options, password);
  } catch (error) {
    await stopContainer(admin, container);
    throw error;
  }

  const target = buildTarget(container, password);
  const pools: Pool[] = [];
  const clients: Client[] = [];
  return {
    admin,
    target,
    connect: (schema) => connectPool(target, pools, schema),
    connectClient: (schema) => connectClient(target, clients, schema),
    stop: () => stopTestDatabase(admin, container, pools, clients),
  };
};
