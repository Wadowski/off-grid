// SPDX-FileCopyrightText: 2026 Dominik Wadowski
// SPDX-License-Identifier: FSL-1.1-ALv2

import { Client } from "pg";
import { afterAll, beforeAll, describe, expect, it } from "vitest";
import { APP_ROLE_NAME } from "./constants.js";
import { createIsolatedDatabase } from "./create-isolated-database.js";
import { dropIsolatedDatabase } from "./drop-isolated-database.js";
import { readConnectionFile } from "./read-connection-file.js";
import { sharedTargetOf } from "./shared-target-of.js";
import { startSharedCluster } from "./start-shared-cluster.js";
import { stopSharedCluster } from "./stop-shared-cluster.js";
import { writeConnectionFile } from "./write-connection-file.js";
import type { SharedClusterConnection, StartedSharedCluster } from "./types.js";

const HOOK_TIMEOUT_MS = 120_000;

describe("createIsolatedDatabase", () => {
  let connection: SharedClusterConnection;
  let ownedCluster: StartedSharedCluster | undefined;
  let connectionFilePath: string | undefined;

  beforeAll(async () => {
    const announced = await readConnectionFile();
    if (announced === undefined) {
      ownedCluster = await startSharedCluster();
      connectionFilePath = await writeConnectionFile(ownedCluster.connection);
      connection = ownedCluster.connection;
    } else {
      connection = announced;
    }
  }, HOOK_TIMEOUT_MS);

  afterAll(async () => {
    if (ownedCluster !== undefined && connectionFilePath !== undefined) {
      await stopSharedCluster(ownedCluster, connectionFilePath);
    }
  }, HOOK_TIMEOUT_MS);

  it("keeps tables and rows of two databases in one cluster apart", async () => {
    const first = await createIsolatedDatabase(connection);
    const second = await createIsolatedDatabase(connection);
    try {
      await first.admin.query("CREATE TABLE probe (value text)");
      await first.admin.query("INSERT INTO probe (value) VALUES ('first only')");
      const { rows } = await second.admin.query("SELECT to_regclass('public.probe') AS found");
      expect(rows[0].found).toBeNull();
    } finally {
      await first.admin.end();
      await second.admin.end();
      await dropIsolatedDatabase(connection, first.name);
      await dropIsolatedDatabase(connection, second.name);
    }
  });

  it("lets the application role log in to each database", async () => {
    const database = await createIsolatedDatabase(connection);
    const target = sharedTargetOf(connection, database.name, APP_ROLE_NAME, connection.appPassword);
    const client = new Client({ ...target });
    try {
      await client.connect();
      const { rows } = await client.query(
        "SELECT current_database() AS name, current_user AS role",
      );
      expect(rows[0]).toEqual({ name: database.name, role: APP_ROLE_NAME });
    } finally {
      await client.end();
      await database.admin.end();
      await dropIsolatedDatabase(connection, database.name);
    }
  });

  it("drops a database while a client is still connected to it", async () => {
    const database = await createIsolatedDatabase(connection);
    const survivor = await createIsolatedDatabase(connection);
    const open = new Client({
      ...sharedTargetOf(connection, database.name, connection.adminUser, connection.adminPassword),
    });
    open.on("error", () => undefined);
    database.admin.on("error", () => undefined);
    await open.connect();
    try {
      await dropIsolatedDatabase(connection, database.name);
      const { rows } = await survivor.admin.query("SELECT 1 AS alive");
      expect(rows[0].alive).toBe(1);
    } finally {
      await open.end().catch(() => undefined);
      await database.admin.end().catch(() => undefined);
      await survivor.admin.end();
      await dropIsolatedDatabase(connection, survivor.name);
    }
  });
});
