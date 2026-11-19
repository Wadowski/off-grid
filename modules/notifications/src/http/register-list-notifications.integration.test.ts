// SPDX-FileCopyrightText: 2026 Dominik Wadowski
// SPDX-License-Identifier: FSL-1.1-ALv2

import { randomUUID } from "node:crypto";
import Fastify, { type FastifyInstance } from "fastify";
import { afterAll, afterEach, beforeAll, beforeEach, describe, expect, it } from "vitest";
import { startNotificationsTestDatabase } from "../../test/start-notifications-test-database.js";
import type { NotificationsTestDatabase } from "../../test/types.js";
import { markOwnNotificationRead } from "../application/inbox/mark-own-notification-read.js";
import { writeInboxNotification } from "../application/inbox/write-inbox-notification.js";
import { registerListNotifications } from "./register-list-notifications.js";

const notice = (userId: string, type = "password-changed") => ({
  notificationId: randomUUID(),
  userId,
  type,
  data: {},
  createdAt: new Date(),
});

describe("list notifications route", { timeout: 60_000 }, () => {
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
    await app.register(async (api) =>
      registerListNotifications(api, {
        db: db.db,
        currentUserId: (request) => request.headers["x-user-id"]?.toString() ?? null,
      }),
    );
  });

  afterEach(async () => {
    await app.close();
  });

  const getList = (userId: string, query = "") =>
    app.inject({
      method: "GET",
      url: `/me/notifications${query}`,
      headers: { "x-user-id": userId },
    });

  it("returns the first page of 20 with the paging fields when no query is given", async () => {
    const anna = randomUUID();
    for (let index = 0; index < 21; index += 1) {
      await writeInboxNotification(db.db, {
        ...notice(anna),
        createdAt: new Date(Date.UTC(2026, 10, 1, 0, index)),
      });
    }

    const response = await getList(anna);

    expect(response.statusCode).toBe(200);
    expect(response.json()).toMatchObject({ unreadCount: 21, total: 21 });
    expect(response.json().notifications).toHaveLength(20);
    expect(response.json().nextCursor).toEqual(expect.any(String));
  });

  it("filters by category and unread together and reports the matching total", async () => {
    const anna = randomUUID();
    const reminder = notice(anna, "event-reminder");
    const invited = notice(anna, "event-invited");
    const recovery = notice(anna, "recovery-code-regenerated");
    await writeInboxNotification(db.db, {
      ...reminder,
      createdAt: new Date("2026-11-01T10:00:00Z"),
    });
    await writeInboxNotification(db.db, {
      ...invited,
      createdAt: new Date("2026-11-02T10:00:00Z"),
    });
    await writeInboxNotification(db.db, {
      ...recovery,
      createdAt: new Date("2026-11-03T10:00:00Z"),
    });
    await markOwnNotificationRead(db.db, anna, invited.notificationId);

    const response = await getList(anna, "?category=calendar&unread=true");

    expect(response.statusCode).toBe(200);
    expect(response.json()).toMatchObject({ total: 1, unreadCount: 2 });
    expect(response.json().notifications).toEqual([
      expect.objectContaining({ id: reminder.notificationId, category: "calendar" }),
    ]);
  });

  it.each([
    "?limit=0",
    "?limit=51",
    "?limit=abc",
    "?category=zz-unknown",
    "?unread=false",
    "?unread=1",
  ])("rejects %s with VALIDATION_FAILED", async (query) => {
    const response = await getList(randomUUID(), query);

    expect(response.statusCode).toBe(400);
    expect(response.json().code).toBe("VALIDATION_FAILED");
  });

  it("rejects an unknown category without echoing it", async () => {
    const category = "zz-unknown";

    const response = await getList(randomUUID(), `?category=${category}`);

    expect(response.statusCode).toBe(400);
    expect(response.json().code).toBe("VALIDATION_FAILED");
    expect(response.body).not.toContain(category);
  });

  it("rejects an invalid cursor with VALIDATION_FAILED and does not echo it", async () => {
    const cursor = "definitely-not-a-cursor";

    const response = await getList(randomUUID(), `?cursor=${cursor}`);

    expect(response.statusCode).toBe(400);
    expect(response.json().code).toBe("VALIDATION_FAILED");
    expect(response.body).not.toContain(cursor);
  });
});
