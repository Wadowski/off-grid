// SPDX-FileCopyrightText: 2026 Dominik Wadowski
// SPDX-License-Identifier: FSL-1.1-ALv2

import type { FastifyInstance } from "fastify";
import { afterAll, afterEach, beforeAll, beforeEach, describe, expect, it } from "vitest";
import { startFakeUpdater } from "../../../test/start-fake-updater.js";
import { startSystemTestDatabase } from "../../../test/start-system-test-database.js";
import { createSystemTestApp } from "../../../test/create-system-test-app.js";
import type { FakeUpdater, SystemTestDatabase } from "../../../test/types.js";
import {
  ADMIN_USER_ID,
  idleStatusReply,
  MEMBER_USER_ID,
  updateStatusFixture,
} from "../../../test/update-fixtures.js";

describe("GET /api/system/update", () => {
  let database: SystemTestDatabase;
  let updater: FakeUpdater;
  let apps: FastifyInstance[];

  beforeAll(async () => {
    database = await startSystemTestDatabase();
  }, 120_000);

  afterAll(async () => {
    await database.stop();
  });

  beforeEach(async () => {
    await database.reset();
    updater = await startFakeUpdater();
    apps = [];
  });

  afterEach(async () => {
    await Promise.all(apps.map((app) => app.close()));
    await updater.stop();
  });

  const openApp = async (
    updaterSettings: FakeUpdater["settings"] | null = updater.settings,
  ): Promise<FastifyInstance> => {
    const app = await createSystemTestApp(database.db, {
      updater: updaterSettings,
      adminUserIds: [ADMIN_USER_ID],
    });
    apps.push(app);
    return app;
  };

  it("answers an admin with the running version and no check yet", async () => {
    updater.respond("GET", "/status", { status: 200, body: idleStatusReply });
    const app = await openApp();

    const response = await app.inject({
      method: "GET",
      url: "/api/system/update",
      headers: { "x-user-id": ADMIN_USER_ID },
    });

    expect(response.statusCode).toBe(200);
    expect(response.json()).toStrictEqual({
      currentVersion: "1.2.3",
      latestVersion: null,
      updateAvailable: false,
      updateAllowed: false,
      checkedAt: null,
      runState: "idle",
      lastRun: null,
      running: false,
      nightlyEnabled: false,
    });
  });

  it("reports the stored check result and makes no check call to the updater", async () => {
    await database.db.systemUpdateSettings.update({
      where: { settingKey: "instance" },
      data: {
        latestVersion: "1.3.0",
        updateAvailable: true,
        updateAllowed: true,
        checkedAt: new Date("2026-11-19T10:00:00.000Z"),
      },
    });
    updater.respond("GET", "/status", { status: 200, body: idleStatusReply });
    const app = await openApp();

    const response = await app.inject({
      method: "GET",
      url: "/api/system/update",
      headers: { "x-user-id": ADMIN_USER_ID },
    });

    expect(response.json()).toMatchObject({
      latestVersion: "1.3.0",
      updateAvailable: true,
      updateAllowed: true,
      checkedAt: "2026-11-19T10:00:00.000Z",
    });
    expect(updater.calls.map((call) => `${call.method} ${call.path}`)).toStrictEqual([
      "GET /status",
    ]);
    expect(updater.calls[0]?.authorization).toBe(`Bearer ${updater.settings.token}`);
  });

  it("reports an interrupted run when the updater holds no lock", async () => {
    updater.respond("GET", "/status", {
      status: 200,
      body: { update: updateStatusFixture("in_progress"), running: false },
    });
    const app = await openApp();

    const response = await app.inject({
      method: "GET",
      url: "/api/system/update",
      headers: { "x-user-id": ADMIN_USER_ID },
    });

    expect(response.json()).toMatchObject({ runState: "interrupted", running: false });
  });

  it("reports a run while the updater holds its lock", async () => {
    updater.respond("GET", "/status", {
      status: 200,
      body: { update: updateStatusFixture("in_progress"), running: true },
    });
    const app = await openApp();

    const response = await app.inject({
      method: "GET",
      url: "/api/system/update",
      headers: { "x-user-id": ADMIN_USER_ID },
    });

    expect(response.json()).toMatchObject({ runState: "running", running: true });
  });

  it("refuses a signed-in user who is not an instance admin without calling the updater", async () => {
    const app = await openApp();

    const response = await app.inject({
      method: "GET",
      url: "/api/system/update",
      headers: { "x-user-id": MEMBER_USER_ID },
    });

    expect(response.statusCode).toBe(403);
    expect(response.json()).toMatchObject({ code: "ACCESS_DENIED" });
    expect(updater.calls).toHaveLength(0);
  });

  it("answers 401 to an anonymous request", async () => {
    const app = await openApp();

    const response = await app.inject({ method: "GET", url: "/api/system/update" });

    expect(response.statusCode).toBe(401);
  });

  it("answers 503 when no updater is configured", async () => {
    const app = await openApp(null);

    const response = await app.inject({
      method: "GET",
      url: "/api/system/update",
      headers: { "x-user-id": ADMIN_USER_ID },
    });

    expect(response.statusCode).toBe(503);
    expect(response.json()).toMatchObject({ code: "UPDATER_UNAVAILABLE" });
  });
});
