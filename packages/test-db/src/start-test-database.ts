// SPDX-FileCopyrightText: 2026 Dominik Wadowski
// SPDX-License-Identifier: FSL-1.1-ALv2

import { PostgreSqlContainer, type StartedPostgreSqlContainer } from "@testcontainers/postgresql";
import { Client, type Pool } from "pg";
import { APP_ROLE_NAME, CONTAINER_IMAGE, MIGRATOR_ROLE_NAME } from "./constants.js";
import { connectClient } from "./connect-client.js";
import { connectPool } from "./connect-pool.js";
import { provisionDatabase } from "./provision-database.js";
import { secret } from "./secret.js";
import { stopContainer } from "./stop-container.js";
import { stopTestDatabase } from "./stop-test-database.js";
import { targetOf } from "./target-of.js";
import type { TestDatabase } from "./types.js";

export const startTestDatabase = async (): Promise<TestDatabase> => {
  const container: StartedPostgreSqlContainer = await new PostgreSqlContainer(
    CONTAINER_IMAGE,
  ).start();
  const admin = new Client({ connectionString: container.getConnectionUri() });
  const appPassword = secret();
  const migratorPassword = secret();
  try {
    await admin.connect();
    await provisionDatabase(admin, appPassword, migratorPassword);
  } catch (error) {
    await stopContainer(admin, container);
    throw error;
  }

  const target = targetOf(container, APP_ROLE_NAME, appPassword);
  const migratorTarget = targetOf(container, MIGRATOR_ROLE_NAME, migratorPassword);
  const pools: Pool[] = [];
  const clients: Client[] = [];
  return {
    admin,
    target,
    migratorTarget,
    connect: () => connectPool(target, pools),
    connectClient: () => connectClient(target, clients),
    stop: () => stopTestDatabase(admin, container, pools, clients),
  };
};
