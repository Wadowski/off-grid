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
  MEMBER_USER_ID,
  updaterCheckFixture,
} from "../../../test/update-fixtures.js";

const UNREACHABLE_UPDATER = { url: "http://127.0.0.1:1", token: "test-updater-token" };

describe("POST /api/system/update/check", () => {
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

  const postCheck = (app: FastifyInstance, userId: string | null) =>
    app.inject({
      method: "POST",
      url: "/api/system/update/check",
      headers: userId === null ? {} : { "x-user-id": userId },
    });

  it("asks the updater for a check, stores the result and returns it", async () => {
    updater.respond("POST", "/check", {
      status: 200,
      body: updaterCheckFixture({ latestVersion: "1.3.0" }),
    });
    const app = await openApp();

    const response = await postCheck(app, ADMIN_USER_ID);

    expect(response.statusCode).toBe(200);
    expect(response.json()).toMatchObject({
      currentVersion: "1.2.3",
      latestVersion: "1.3.0",
      updateAvailable: true,
      updateAllowed: true,
    });
    expect(updater.calls.map((call) => `${call.method} ${call.path}`)).toStrictEqual([
      "POST /check",
    ]);
    const stored = await database.db.systemUpdateSettings.findUniqueOrThrow({
      where: { settingKey: "instance" },
    });
    expect(stored.latestVersion).toBe("1.3.0");
    expect(stored.checkedAt).not.toBeNull();
  });

  it("answers 503 when the updater cannot be reached", async () => {
    const app = await openApp(UNREACHABLE_UPDATER);

    const response = await postCheck(app, ADMIN_USER_ID);

    expect(response.statusCode).toBe(503);
    expect(response.json()).toMatchObject({ code: "UPDATER_UNAVAILABLE" });
  });

  it("answers 502 when the updater cannot reach the release source", async () => {
    updater.respond("POST", "/check", {
      status: 502,
      body: { error: "release_source_unreachable" },
    });
    const app = await openApp();

    const response = await postCheck(app, ADMIN_USER_ID);

    expect(response.statusCode).toBe(502);
    expect(response.json()).toMatchObject({ code: "RELEASE_SOURCE_UNREACHABLE" });
  });

  it("answers 409 when the running version is not a release", async () => {
    updater.respond("POST", "/check", {
      status: 503,
      body: { error: "current_version_unknown" },
    });
    const app = await openApp();

    const response = await postCheck(app, ADMIN_USER_ID);

    expect(response.statusCode).toBe(409);
    expect(response.json()).toMatchObject({ code: "CURRENT_VERSION_UNKNOWN" });
  });

  it("refuses a signed-in user who is not an instance admin without calling the updater", async () => {
    const app = await openApp();

    const response = await postCheck(app, MEMBER_USER_ID);

    expect(response.statusCode).toBe(403);
    expect(response.json()).toMatchObject({ code: "ACCESS_DENIED" });
    expect(updater.calls).toHaveLength(0);
  });

  it("answers 401 to an anonymous request", async () => {
    const app = await openApp();

    const response = await postCheck(app, null);

    expect(response.statusCode).toBe(401);
  });

  it("answers 503 when no updater is configured", async () => {
    const app = await openApp(null);

    const response = await postCheck(app, ADMIN_USER_ID);

    expect(response.statusCode).toBe(503);
    expect(response.json()).toMatchObject({ code: "UPDATER_UNAVAILABLE" });
  });
});
