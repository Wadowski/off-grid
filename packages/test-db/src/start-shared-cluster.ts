// SPDX-FileCopyrightText: 2026 Dominik Wadowski
// SPDX-License-Identifier: FSL-1.1-ALv2

import { PostgreSqlContainer } from "@testcontainers/postgresql";
import { Client } from "pg";
import {
  CONTAINER_IMAGE,
  SHARED_CLUSTER_LABEL_VALUE,
  SHARED_CLUSTER_SERVER_SETTINGS,
  TEST_DATABASE_LABEL,
} from "./constants.js";
import { provisionSharedRoles } from "./provision-shared-roles.js";
import { secret } from "./secret.js";
import { stopContainer } from "./stop-container.js";
import type { SharedClusterConnection, StartedSharedCluster } from "./types.js";

export const startSharedCluster = async (): Promise<StartedSharedCluster> => {
  const container = await new PostgreSqlContainer(CONTAINER_IMAGE)
    .withLabels({ [TEST_DATABASE_LABEL]: SHARED_CLUSTER_LABEL_VALUE })
    .withCommand([
      "postgres",
      ...SHARED_CLUSTER_SERVER_SETTINGS.flatMap((setting) => ["-c", setting]),
    ])
    .start();
  const admin = new Client({ connectionString: container.getConnectionUri() });
  const connection: SharedClusterConnection = {
    host: container.getHost(),
    port: container.getPort(),
    maintenanceDatabase: container.getDatabase(),
    adminUser: container.getUsername(),
    adminPassword: container.getPassword(),
    appPassword: secret(),
    migratorPassword: secret(),
  };
  try {
    await admin.connect();
    await provisionSharedRoles(admin, connection);
  } catch (error) {
    await stopContainer(admin, container);
    throw error;
  }
  return { container, admin, connection };
};
