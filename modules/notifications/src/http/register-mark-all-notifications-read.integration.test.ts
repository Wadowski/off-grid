// SPDX-FileCopyrightText: 2026 Dominik Wadowski
// SPDX-License-Identifier: FSL-1.1-ALv2

import { randomUUID } from "node:crypto";
import Fastify, { type FastifyInstance } from "fastify";
import { afterAll, afterEach, beforeAll, beforeEach, describe, expect, it } from "vitest";
import { startNotificationsTestDatabase } from "../../test/start-notifications-test-database.js";
import type { NotificationsTestDatabase } from "../../test/types.js";
import { listOwnNotifications } from "../application/inbox/list-own-notifications.js";
import { writeInboxNotification } from "../application/inbox/write-inbox-notification.js";
import { registerMarkAllNotificationsRead } from "./register-mark-all-notifications-read.js";
import { registerMarkNotificationRead } from "./register-mark-notification-read.js";

const notice = (userId: string, type = "password-changed") => ({
  notificationId: randomUUID(),
  userId,
  type,
  data: {},
  createdAt: new Date(),
});

describe("mark all notifications read route", { timeout: 60_000 }, () => {
  let db: NotificationsTestDatabase;
  let app: FastifyInstance;

  beforeAll(async () => {
    db = await startNotificationsTestDatabase();
  }, 120_000);

  afterAll(async () => {
    await db.stop();
  }, 120_000);

  beforeEach(async () => {
    await db.reset();
    app = Fastify();
    await app.register(async (api) => {
      const context = {
        db: db.db,
        currentUserId: (request) => request.headers["x-user-id"]?.toString() ?? null,
      };
      registerMarkNotificationRead(api, context);
      registerMarkAllNotificationsRead(api, context);
    });
  });

  afterEach(async () => {
    await app.close();
  });

  const postReadAll = (userId?: string) =>
    app.inject({
      method: "POST",
      url: "/me/notifications/read-all",
      headers: userId === undefined ? {} : { "x-user-id": userId },
    });

  it("marks the caller's unread notices and returns how many", async () => {
    const anna = randomUUID();
    await writeInboxNotification(db.db, {
      ...notice(anna),
      createdAt: new Date("2026-11-01T10:00:00Z"),
    });
    await writeInboxNotification(db.db, {
      ...notice(anna, "recovery-code-regenerated"),
      createdAt: new Date("2026-11-02T10:00:00Z"),
    });

    const response = await postReadAll(anna);
    const list = await listOwnNotifications(db.db, anna, { limit: 20 });

    expect(response.statusCode).toBe(200);
    expect(response.json()).toEqual({ updated: 2 });
    expect(list.unreadCount).toBe(0);
  });

  it("leaves another person's notices unread", async () => {
    const anna = randomUUID();
    const tom = randomUUID();
    await writeInboxNotification(db.db, {
      ...notice(tom),
      createdAt: new Date("2026-11-01T10:00:00Z"),
    });

    await postReadAll(anna);
    const tomList = await listOwnNotifications(db.db, tom, { limit: 20 });

    expect(tomList.unreadCount).toBe(1);
  });

  it("returns unauthenticated when no person is signed in", async () => {
    const response = await postReadAll();

    expect(response.statusCode).toBe(401);
    expect(response.json()).toMatchObject({ code: "UNAUTHENTICATED" });
  });
});
