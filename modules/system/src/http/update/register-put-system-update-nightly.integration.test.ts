// SPDX-FileCopyrightText: 2026 Dominik Wadowski
// SPDX-License-Identifier: FSL-1.1-ALv2

import type { FastifyInstance } from "fastify";
import { afterAll, afterEach, beforeAll, beforeEach, describe, expect, it } from "vitest";
import { createSystemTestApp } from "../../../test/create-system-test-app.js";
import { startFakeUpdater } from "../../../test/start-fake-updater.js";
import { startSystemTestDatabase } from "../../../test/start-system-test-database.js";
import type { FakeUpdater, SystemTestDatabase } from "../../../test/types.js";
import { ADMIN_USER_ID, idleStatusReply, MEMBER_USER_ID } from "../../../test/update-fixtures.js";

describe("PUT /api/system/update/nightly", () => {
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

  const putNightly = (app: FastifyInstance, userId: string | null, payload: unknown) =>
    app.inject({
      method: "PUT",
      url: "/api/system/update/nightly",
      headers: userId === null ? {} : { "x-user-id": userId },
      payload: payload as Record<string, unknown>,
    });

  const readNightlyEnabled = async (app: FastifyInstance): Promise<boolean> => {
    const response = await app.inject({
      method: "GET",
      url: "/api/system/update",
      headers: { "x-user-id": ADMIN_USER_ID },
    });
    return response.json<{ nightlyEnabled: boolean }>().nightlyEnabled;
  };

  it("starts disabled and persists the setting across requests", async () => {
    const app = await openApp();
    expect(await readNightlyEnabled(app)).toBe(false);

    const enable = await putNightly(app, ADMIN_USER_ID, { enabled: true });
    expect(enable.statusCode).toBe(200);
    expect(enable.json()).toStrictEqual({ enabled: true });
    expect(await readNightlyEnabled(app)).toBe(true);

    const disable = await putNightly(app, ADMIN_USER_ID, { enabled: false });
    expect(disable.json()).toStrictEqual({ enabled: false });
    expect(await readNightlyEnabled(app)).toBe(false);
  });

  it("rejects a value that is not a boolean and leaves the setting unchanged", async () => {
    const app = await openApp();

    const response = await putNightly(app, ADMIN_USER_ID, { enabled: "yes" });

    expect(response.statusCode).toBe(400);
    expect(response.json()).toMatchObject({ code: "VALIDATION_FAILED" });
    expect(await readNightlyEnabled(app)).toBe(false);
  });

  it("rejects keys beyond enabled", async () => {
    const app = await openApp();

    const response = await putNightly(app, ADMIN_USER_ID, { enabled: true, hour: 3 });

    expect(response.statusCode).toBe(400);
    expect(await readNightlyEnabled(app)).toBe(false);
  });

  it("refuses a signed-in user who is not an instance admin", async () => {
    const app = await openApp();

    const response = await putNightly(app, MEMBER_USER_ID, { enabled: true });

    expect(response.statusCode).toBe(403);
    expect(response.json()).toMatchObject({ code: "ACCESS_DENIED" });
    expect(await readNightlyEnabled(app)).toBe(false);
  });

  it("answers 401 to an anonymous request", async () => {
    const app = await openApp();

    const response = await putNightly(app, null, { enabled: true });

    expect(response.statusCode).toBe(401);
  });

  it("stores the setting without an updater configured", async () => {
    const app = await openApp(null);

    const response = await putNightly(app, ADMIN_USER_ID, { enabled: true });

    expect(response.statusCode).toBe(200);
    expect(response.json()).toStrictEqual({ enabled: true });
  });
});
