// SPDX-FileCopyrightText: 2026 Dominik Wadowski
// SPDX-License-Identifier: FSL-1.1-ALv2

import { afterAll, beforeAll, describe, expect, it } from "vitest";
import { migrateDeploy } from "@offgrid/db";
import { startTestDatabase } from "../../test/start-test-database.js";
import type { TestDatabase } from "../../test/types.js";
import { startServer } from "./start-server.js";
import type { ServerConfig } from "../types.js";

let database: TestDatabase;

const configFor = (db: TestDatabase): ServerConfig => ({
  http: { host: "127.0.0.1", port: 0 },
  database: db.connection,
  mail: { encryptionKey: Buffer.alloc(32, 7) },
  trustedProxies: [],
  corsOrigins: [],
  rateLimitPerMinute: 1000,
  logLevel: "error",
});

beforeAll(async () => {
  database = await startTestDatabase();
}, 120_000);

afterAll(async () => {
  await database?.stop();
});

describe("startServer", () => {
  it("reports migrations unavailable on a database where none have run", async () => {
    const running = await startServer(configFor(database), []);

    const response = await fetch(`${running.baseUrl}/api/health/ready`);

    expect(response.status).toBe(503);
    expect(await response.json()).toEqual({
      status: "unavailable",
      checks: { database: "ok", publisher: "ok", migrations: "unavailable" },
    });

    await running.close();
  }, 60_000);

  it("boots, reports ready and closes cleanly once the migrations have run", async () => {
    await migrateDeploy(database.migratorTarget);
    const running = await startServer(configFor(database), []);

    const response = await fetch(`${running.baseUrl}/api/health/ready`);

    expect(response.status).toBe(200);
    expect(await response.json()).toEqual({
      status: "ok",
      checks: { database: "ok", publisher: "ok", migrations: "ok" },
    });

    await running.close();
    await running.close();
  }, 60_000);

  it("refuses to boot when the database cannot be reached", async () => {
    const unreachable: ServerConfig = {
      ...configFor(database),
      database: { ...database.connection, password: "wrong-password" },
    };

    await expect(startServer(unreachable, [])).rejects.toThrow(/password authentication failed/);
  });
});
