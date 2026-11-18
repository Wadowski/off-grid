// SPDX-FileCopyrightText: 2026 Dominik Wadowski
// SPDX-License-Identifier: FSL-1.1-ALv2

import { randomUUID } from "node:crypto";
import { afterAll, beforeAll, beforeEach, describe, expect, it } from "vitest";
import { startNotificationsTestDatabase } from "../../../test/start-notifications-test-database.js";
import type { NotificationsTestDatabase } from "../../../test/types.js";
import { InvalidNotificationCursorError } from "../errors/invalid-notification-cursor-error.js";
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
    const list = await listOwnNotifications(db.db, anna, { limit: 20 });

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

    const list = await listOwnNotifications(db.db, anna, { limit: 20 });

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

    const list = await listOwnNotifications(db.db, anna, { limit: 20 });

    expect(list.notifications).toEqual([]);
    expect(list.unreadCount).toBe(0);
  });

  describe("paging", () => {
    const walkPages = async (userId: string, limit: number) => {
      const ids: string[] = [];
      let cursor: string | undefined;
      for (;;) {
        const page = await listOwnNotifications(db.db, userId, { limit, cursor });
        ids.push(...page.notifications.map((item) => item.id));
        if (page.nextCursor === null) {
          return { ids, lastPage: page };
        }
        cursor = page.nextCursor;
      }
    };

    it("returns the page size, a next cursor, and the total and unread counts for the whole inbox", async () => {
      const anna = randomUUID();
      for (let day = 1; day <= 5; day += 1) {
        await writeInboxNotification(db.db, notice(anna), new Date(`2026-11-0${day}T10:00:00Z`));
      }

      const first = await listOwnNotifications(db.db, anna, { limit: 2 });

      expect(first.notifications).toHaveLength(2);
      expect(first.nextCursor).not.toBeNull();
      expect(first.total).toBe(5);
      expect(first.unreadCount).toBe(5);
    });

    it("walks every page once, in newest-first order, and ends with a null cursor", async () => {
      const anna = randomUUID();
      const written: string[] = [];
      for (let day = 1; day <= 5; day += 1) {
        const item = notice(anna);
        written.push(item.notificationId);
        await writeInboxNotification(db.db, item, new Date(`2026-11-0${day}T10:00:00Z`));
      }

      const { ids, lastPage } = await walkPages(anna, 2);

      expect(ids).toEqual([...written].reverse());
      expect(lastPage.nextCursor).toBeNull();
    });

    it("pages rows with equal timestamps in id order without skipping or repeating", async () => {
      const anna = randomUUID();
      const sameMoment = new Date("2026-11-01T10:00:00Z");
      const written: string[] = [];
      for (let index = 0; index < 5; index += 1) {
        const item = notice(anna);
        written.push(item.notificationId);
        await writeInboxNotification(db.db, item, sameMoment);
      }

      const { ids } = await walkPages(anna, 2);

      expect(ids).toEqual([...written].sort().reverse());
    });

    it("does not shift the next page when a notice arrives between two page requests", async () => {
      const anna = randomUUID();
      const written: string[] = [];
      for (let day = 1; day <= 4; day += 1) {
        const item = notice(anna);
        written.push(item.notificationId);
        await writeInboxNotification(db.db, item, new Date(`2026-11-0${day}T10:00:00Z`));
      }
      const first = await listOwnNotifications(db.db, anna, { limit: 2 });
      await writeInboxNotification(db.db, notice(anna), new Date("2026-11-09T10:00:00Z"));

      const second = await listOwnNotifications(db.db, anna, {
        limit: 2,
        cursor: first.nextCursor ?? undefined,
      });

      expect(second.notifications.map((item) => item.id)).toEqual([...written].reverse().slice(2));
      expect(second.nextCursor).toBeNull();
    });

    it("never counts or returns another person's rows", async () => {
      const anna = randomUUID();
      const tom = randomUUID();
      await writeInboxNotification(db.db, notice(anna), new Date("2026-11-01T10:00:00Z"));
      await writeInboxNotification(db.db, notice(tom), new Date("2026-11-02T10:00:00Z"));
      await writeInboxNotification(db.db, notice(tom), new Date("2026-11-03T10:00:00Z"));

      const list = await listOwnNotifications(db.db, anna, { limit: 1 });

      expect(list.notifications).toHaveLength(1);
      expect(list.total).toBe(1);
      expect(list.unreadCount).toBe(1);
      expect(list.nextCursor).toBeNull();
    });

    it("rejects a cursor it did not write", async () => {
      const anna = randomUUID();

      await expect(
        listOwnNotifications(db.db, anna, { limit: 2, cursor: "not-a-cursor" }),
      ).rejects.toBeInstanceOf(InvalidNotificationCursorError);
    });
  });
});
