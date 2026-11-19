// SPDX-FileCopyrightText: 2026 Dominik Wadowski
// SPDX-License-Identifier: FSL-1.1-ALv2

import type { FastifyInstance } from "fastify";
import { afterAll, afterEach, beforeAll, beforeEach, describe, expect, it } from "vitest";
import { createSystemTestApp } from "../../../test/create-system-test-app.js";
import { TEST_UPDATER_TOKEN } from "../../../test/constants.js";
import { startFakeUpdater } from "../../../test/start-fake-updater.js";
import { startSystemTestDatabase } from "../../../test/start-system-test-database.js";
import type { FakeUpdater, SystemTestDatabase } from "../../../test/types.js";
import { ADMIN_USER_ID, idleStatusReply } from "../../../test/update-fixtures.js";

describe("GET /api/system/updater/nightly", () => {
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
    updaterToken: string | null = TEST_UPDATER_TOKEN,
  ): Promise<FastifyInstance> => {
    const app = await createSystemTestApp(database.db, {
      updater: updaterToken === null ? null : { url: updater.settings.url, token: updaterToken },
      adminUserIds: [ADMIN_USER_ID],
    });
    apps.push(app);
    return app;
  };

  const getUpdaterNightly = (app: FastifyInstance, headers: Record<string, string>) =>
    app.inject({ method: "GET", url: "/api/system/updater/nightly", headers });

  const setNightly = (app: FastifyInstance, enabled: boolean) =>
    app.inject({
      method: "PUT",
      url: "/api/system/update/nightly",
      headers: { "x-user-id": ADMIN_USER_ID },
      payload: { enabled },
    });

  it("answers the stored setting to the updater, starting disabled", async () => {
    const app = await openApp();

    const response = await getUpdaterNightly(app, {
      authorization: `Bearer ${TEST_UPDATER_TOKEN}`,
    });

    expect(response.statusCode).toBe(200);
    expect(response.json()).toStrictEqual({ enabled: false });
  });

  it("reflects the setting after an admin turns it on", async () => {
    const app = await openApp();
    await setNightly(app, true);

    const response = await getUpdaterNightly(app, {
      authorization: `Bearer ${TEST_UPDATER_TOKEN}`,
    });

    expect(response.json()).toStrictEqual({ enabled: true });
  });

  it.each([
    ["a wrong token", { authorization: "Bearer wrong-updater-token" }],
    ["a token of another length", { authorization: `Bearer ${TEST_UPDATER_TOKEN}-longer` }],
    ["a missing token", {}],
    ["a signed-in user without a bearer token", { "x-user-id": ADMIN_USER_ID }],
  ])("answers 401 to %s", async (_label, headers) => {
    const app = await openApp();
    await setNightly(app, true);

    const response = await getUpdaterNightly(app, headers);

    expect(response.statusCode).toBe(401);
    expect(response.json()).toStrictEqual({
      code: "UNAUTHENTICATED",
      message: "The updater token is missing or wrong",
    });
  });

  it("answers 503 when no updater token is configured", async () => {
    const app = await openApp(null);

    const response = await getUpdaterNightly(app, {
      authorization: `Bearer ${TEST_UPDATER_TOKEN}`,
    });

    expect(response.statusCode).toBe(503);
    expect(response.json()).toMatchObject({ code: "UPDATER_UNAVAILABLE" });
  });
});
