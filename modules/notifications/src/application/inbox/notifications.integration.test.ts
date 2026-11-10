// SPDX-FileCopyrightText: 2026 Dominik Wadowski
// SPDX-License-Identifier: FSL-1.1-ALv2

import { randomUUID } from "node:crypto";
import { afterAll, beforeAll, beforeEach, describe, expect, it } from "vitest";
import { startNotificationsTestDatabase } from "../../../test/start-notifications-test-database.js";
import type { NotificationsTestDatabase } from "../../../test/types.js";
import { NotificationNotFoundError } from "../errors/notification-not-found-error.js";
import { listOwnNotifications } from "./list-own-notifications.js";
import { markOwnNotificationRead } from "./mark-own-notification-read.js";
import { writeInboxNotification } from "./write-inbox-notification.js";

const notice = (userId: string, type = "password-changed") => ({
  notificationId: randomUUID(),
  userId,
  type,
  data: {},
});

describe("inbox", { timeout: 60_000 }, () => {
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

  it("lists own items newest first with the unread count, and marks one read", async () => {
    const anna = randomUUID();
    const older = notice(anna);
    const newer = notice(anna, "recovery-code-regenerated");
    await writeInboxNotification(db.db, older, new Date("2026-11-01T10:00:00Z"));
    await writeInboxNotification(db.db, newer, new Date("2026-11-02T10:00:00Z"));

    await markOwnNotificationRead(db.db, anna, older.notificationId);
    const list = await listOwnNotifications(db.db, anna);

    expect(list.notifications.map((item) => item.id)).toEqual([
      newer.notificationId,
      older.notificationId,
    ]);
    expect(list.unreadCount).toBe(1);
    expect(list.notifications[1]?.readAt).not.toBeNull();
  });

  it("writes the same notice once when it arrives twice", async () => {
    const anna = randomUUID();
    const item = notice(anna);
    await writeInboxNotification(db.db, item, new Date());
    await writeInboxNotification(db.db, item, new Date());

    const list = await listOwnNotifications(db.db, anna);

    expect(list.notifications).toHaveLength(1);
  });

  it("refuses to mark another person's item read", async () => {
    const anna = randomUUID();
    const tom = randomUUID();
    const item = notice(tom);
    await writeInboxNotification(db.db, item, new Date());

    await expect(markOwnNotificationRead(db.db, anna, item.notificationId)).rejects.toBeInstanceOf(
      NotificationNotFoundError,
    );
  });

  it("keeps one person's inbox out of another person's list", async () => {
    const anna = randomUUID();
    const tom = randomUUID();
    await writeInboxNotification(db.db, notice(tom), new Date());

    const list = await listOwnNotifications(db.db, anna);

    expect(list.notifications).toEqual([]);
    expect(list.unreadCount).toBe(0);
  });
});
