// SPDX-FileCopyrightText: 2026 Dominik Wadowski
// SPDX-License-Identifier: FSL-1.1-ALv2

import { Client } from "pg";
import { afterAll, beforeAll, describe, expect, it } from "vitest";
import { APP_ROLE_NAME, MIGRATOR_ROLE_NAME } from "./constants.js";
import { createIsolatedDatabase } from "./create-isolated-database.js";
import { dropIsolatedDatabase } from "./drop-isolated-database.js";
import { openAdminClient } from "./open-admin-client.js";
import { readConnectionFile } from "./read-connection-file.js";
import { startSharedCluster } from "./start-shared-cluster.js";
import { stopSharedCluster } from "./stop-shared-cluster.js";
import { writeConnectionFile } from "./write-connection-file.js";
import type { SharedClusterConnection, StartedSharedCluster } from "./types.js";

const HOOK_TIMEOUT_MS = 120_000;
const PARALLEL_TEST_TIMEOUT_MS = 60_000;
const PARALLEL_DATABASES = 20;

describe("shared cluster provisioning", () => {
  let connection: SharedClusterConnection;
  let ownedCluster: StartedSharedCluster | undefined;
  let connectionFilePath: string | undefined;
  let admin: Client;

  beforeAll(async () => {
    const announced = await readConnectionFile();
    if (announced === undefined) {
      ownedCluster = await startSharedCluster();
      connectionFilePath = await writeConnectionFile(ownedCluster.connection);
      connection = ownedCluster.connection;
    } else {
      connection = announced;
    }
    admin = await openAdminClient(connection, connection.maintenanceDatabase);
  }, HOOK_TIMEOUT_MS);

  afterAll(async () => {
    await admin.end();
    if (ownedCluster !== undefined && connectionFilePath !== undefined) {
      await stopSharedCluster(ownedCluster, connectionFilePath);
    }
  }, HOOK_TIMEOUT_MS);

  it("creates each cluster role exactly once", async () => {
    const { rows } = await admin.query(
      "SELECT rolname FROM pg_roles WHERE rolname IN ($1, $2) ORDER BY rolname",
      [APP_ROLE_NAME, MIGRATOR_ROLE_NAME],
    );
    expect(rows.map((row) => row.rolname)).toEqual([APP_ROLE_NAME, MIGRATOR_ROLE_NAME]);
  });

  it("lets the application role log in with the run-wide password", async () => {
    const client = new Client({
      host: connection.host,
      port: connection.port,
      database: connection.maintenanceDatabase,
      user: APP_ROLE_NAME,
      password: connection.appPassword,
    });
    await client.connect();
    await client.end();
  });

  it(
    "creates parallel isolated databases without a role clash",
    async () => {
      const databases = await Promise.all(
        Array.from({ length: PARALLEL_DATABASES }, () => createIsolatedDatabase(connection)),
      );
      try {
        expect(new Set(databases.map((database) => database.name)).size).toBe(PARALLEL_DATABASES);
      } finally {
        await Promise.all(databases.map((database) => database.admin.end()));
        await Promise.all(
          databases.map((database) => dropIsolatedDatabase(connection, database.name)),
        );
      }
    },
    PARALLEL_TEST_TIMEOUT_MS,
  );
});
