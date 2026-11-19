// SPDX-FileCopyrightText: 2026 Dominik Wadowski
// SPDX-License-Identifier: FSL-1.1-ALv2

import { randomUUID } from "node:crypto";
import { afterAll, beforeAll, beforeEach, describe, expect, it } from "vitest";
import { startNotificationsTestDatabase } from "../../../test/start-notifications-test-database.js";
import type { NotificationsTestDatabase } from "../../../test/types.js";
import { markAllOwnNotificationsRead } from "./mark-all-own-notifications-read.js";
import { listOwnNotifications } from "./list-own-notifications.js";
import { markOwnNotificationRead } from "./mark-own-notification-read.js";
import { writeInboxNotification } from "./write-inbox-notification.js";

const notice = (userId: string, type = "password-changed") => ({
  notificationId: randomUUID(),
  userId,
  type,
  data: {},
  createdAt: new Date(),
});

describe("mark all own notifications read", { timeout: 60_000 }, () => {
  let db: NotificationsTestDatabase;

  beforeAll(async () => {
    db = await startNotificationsTestDatabase();
  }, 120_000);

  afterAll(async () => {
    await db.stop();
  }, 120_000);

  beforeEach(async () => {
    await db.reset();
  });

  it("marks only the unread rows of the caller and returns their count", async () => {
    const anna = randomUUID();
    const first = notice(anna);
    const second = notice(anna, "recovery-code-regenerated");
    await writeInboxNotification(db.db, { ...first, createdAt: new Date("2026-11-01T10:00:00Z") });
    await writeInboxNotification(db.db, { ...second, createdAt: new Date("2026-11-02T10:00:00Z") });

    const result = await markAllOwnNotificationsRead(db.db, anna, new Date("2026-11-03T10:00:00Z"));
    const list = await listOwnNotifications(db.db, anna, { limit: 20 });

    expect(result).toEqual({ updated: 2 });
    expect(list.unreadCount).toBe(0);
    expect(list.notifications.every((item) => item.readAt !== null)).toBe(true);
  });

  it("keeps the first read time of a notice that was already read", async () => {
    const anna = randomUUID();
    const read = notice(anna);
    const unread = notice(anna, "recovery-code-regenerated");
    await writeInboxNotification(db.db, { ...read, createdAt: new Date("2026-11-01T10:00:00Z") });
    await writeInboxNotification(db.db, { ...unread, createdAt: new Date("2026-11-02T10:00:00Z") });
    const firstReadAt = new Date("2026-11-04T08:00:00Z");
    await markOwnNotificationRead(db.db, anna, read.notificationId, firstReadAt);

    const result = await markAllOwnNotificationsRead(db.db, anna, new Date("2026-11-05T08:00:00Z"));
    const list = await listOwnNotifications(db.db, anna, { limit: 20 });
    const alreadyRead = list.notifications.find((item) => item.id === read.notificationId);

    expect(result).toEqual({ updated: 1 });
    expect(new Date(alreadyRead?.readAt ?? "").toISOString()).toBe(firstReadAt.toISOString());
  });

  it("leaves another person's notices unread and does not count them", async () => {
    const anna = randomUUID();
    const tom = randomUUID();
    await writeInboxNotification(db.db, {
      ...notice(anna),
      createdAt: new Date("2026-11-01T10:00:00Z"),
    });
    await writeInboxNotification(db.db, {
      ...notice(tom),
      createdAt: new Date("2026-11-01T11:00:00Z"),
    });

    const result = await markAllOwnNotificationsRead(db.db, anna);
    const tomList = await listOwnNotifications(db.db, tom, { limit: 20 });

    expect(result).toEqual({ updated: 1 });
    expect(tomList.unreadCount).toBe(1);
  });

  it("returns zero when the caller has nothing unread", async () => {
    const anna = randomUUID();
    await writeInboxNotification(db.db, {
      ...notice(anna),
      createdAt: new Date("2026-11-01T10:00:00Z"),
    });
    await markAllOwnNotificationsRead(db.db, anna);

    const result = await markAllOwnNotificationsRead(db.db, anna);

    expect(result).toEqual({ updated: 0 });
  });
});
