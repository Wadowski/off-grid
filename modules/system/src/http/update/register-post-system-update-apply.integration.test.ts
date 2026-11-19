// SPDX-FileCopyrightText: 2026 Dominik Wadowski
// SPDX-License-Identifier: FSL-1.1-ALv2

import type { FastifyInstance } from "fastify";
import { afterAll, afterEach, beforeAll, beforeEach, describe, expect, it } from "vitest";
import { createSystemTestApp } from "../../../test/create-system-test-app.js";
import { startFakeUpdater } from "../../../test/start-fake-updater.js";
import { startSystemTestDatabase } from "../../../test/start-system-test-database.js";
import type { FakeUpdater, SystemTestDatabase } from "../../../test/types.js";
import {
  ADMIN_USER_ID,
  idleStatusReply,
  MEMBER_USER_ID,
  updateStatusFixture,
  updaterCheckFixture,
} from "../../../test/update-fixtures.js";

const applyCalls = (updater: FakeUpdater) =>
  updater.calls.filter((call) => call.method === "POST" && call.path === "/apply");

describe("POST /api/system/update/apply", () => {
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
    updater.respond("GET", "/status", { status: 200, body: idleStatusReply });
    updater.respond("POST", "/check", { status: 200, body: updaterCheckFixture() });
    updater.respond("POST", "/apply", {
      status: 202,
      body: { started: true, targetVersion: "1.3.0" },
    });
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

  const postApply = (app: FastifyInstance, userId: string | null) =>
    app.inject({
      method: "POST",
      url: "/api/system/update/apply",
      headers: userId === null ? {} : { "x-user-id": userId },
    });

  it("re-checks, then starts the apply for the fresh latest version", async () => {
    const app = await openApp();

    const response = await postApply(app, ADMIN_USER_ID);

    expect(response.statusCode).toBe(202);
    expect(response.json()).toStrictEqual({ started: true, targetVersion: "1.3.0" });
    expect(applyCalls(updater).map((call) => call.body)).toStrictEqual([{ version: "1.3.0" }]);
  });

  it("starts an apply after a run was interrupted by an updater restart", async () => {
    updater.respond("GET", "/status", {
      status: 200,
      body: { update: updateStatusFixture("in_progress"), running: false },
    });
    const app = await openApp();

    const response = await postApply(app, ADMIN_USER_ID);

    expect(response.statusCode).toBe(202);
    expect(applyCalls(updater)).toHaveLength(1);
  });

  it("refuses with 409 when no newer release is available", async () => {
    updater.respond("POST", "/check", {
      status: 200,
      body: updaterCheckFixture({ updateAvailable: false }),
    });
    const app = await openApp();

    const response = await postApply(app, ADMIN_USER_ID);

    expect(response.statusCode).toBe(409);
    expect(response.json()).toMatchObject({ code: "NO_UPDATE_AVAILABLE" });
    expect(applyCalls(updater)).toHaveLength(0);
  });

  it("refuses with 409 when the running version may not update", async () => {
    updater.respond("POST", "/check", {
      status: 200,
      body: updaterCheckFixture({ updateAllowed: false }),
    });
    const app = await openApp();

    const response = await postApply(app, ADMIN_USER_ID);

    expect(response.statusCode).toBe(409);
    expect(response.json()).toMatchObject({ code: "UPDATE_NOT_ALLOWED" });
    expect(applyCalls(updater)).toHaveLength(0);
  });

  it("refuses with 409 while an update is running, without calling apply", async () => {
    updater.respond("GET", "/status", {
      status: 200,
      body: { update: updateStatusFixture("in_progress"), running: true },
    });
    const app = await openApp();

    const response = await postApply(app, ADMIN_USER_ID);

    expect(response.statusCode).toBe(409);
    expect(response.json()).toMatchObject({ code: "UPDATE_ALREADY_RUNNING" });
    expect(updater.calls.map((call) => `${call.method} ${call.path}`)).toStrictEqual([
      "GET /status",
    ]);
  });

  it("maps a conflict the updater reports on a race to 409 UPDATE_ALREADY_RUNNING", async () => {
    updater.respond("POST", "/apply", {
      status: 409,
      body: { error: "update_already_running" },
    });
    const app = await openApp();

    const response = await postApply(app, ADMIN_USER_ID);

    expect(response.statusCode).toBe(409);
    expect(response.json()).toMatchObject({ code: "UPDATE_ALREADY_RUNNING" });
  });

  it("refuses a signed-in user who is not an instance admin without calling the updater", async () => {
    const app = await openApp();

    const response = await postApply(app, MEMBER_USER_ID);

    expect(response.statusCode).toBe(403);
    expect(response.json()).toMatchObject({ code: "ACCESS_DENIED" });
    expect(updater.calls).toHaveLength(0);
  });

  it("answers 401 to an anonymous request", async () => {
    const app = await openApp();

    const response = await postApply(app, null);

    expect(response.statusCode).toBe(401);
  });

  it("answers 503 when no updater is configured", async () => {
    const app = await openApp(null);

    const response = await postApply(app, ADMIN_USER_ID);

    expect(response.statusCode).toBe(503);
    expect(response.json()).toMatchObject({ code: "UPDATER_UNAVAILABLE" });
  });
});
