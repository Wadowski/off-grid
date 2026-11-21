// SPDX-FileCopyrightText: 2026 Dominik Wadowski
// SPDX-License-Identifier: FSL-1.1-ALv2

import { randomUUID } from "node:crypto";
import { afterAll, beforeAll, beforeEach, describe, expect, it } from "vitest";
import { startNotificationsTestDatabase } from "../../../test/start-notifications-test-database.js";
import type { NotificationsTestDatabase } from "../../../test/types.js";
import { MAX_REPLAY_NOTICES } from "../../constants.js";
import type { InboxNotice } from "../../types.js";
import { readMissedNotifications } from "./read-missed-notifications.js";
import { writeInboxNotification } from "./write-inbox-notification.js";

const seed = (
  db: NotificationsTestDatabase,
  userId: string,
  createdAt: string,
  notificationId = randomUUID(),
): Promise<boolean> => {
  const notice: InboxNotice = {
    notificationId,
    userId,
    type: "password-changed",
    data: {},
    createdAt: new Date(createdAt),
  };
  return writeInboxNotification(db.db, notice);
};

const BASE_TIME = Date.parse("2026-11-01T00:00:00Z");

const secondsAfterBase = (seconds: number): string =>
  new Date(BASE_TIME + seconds * 1000).toISOString();

const idsOf = (notices: { id: string }[]): string[] => notices.map((notice) => notice.id);

describe("readMissedNotifications", { timeout: 120_000 }, () => {
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

  it("replays the notices newer than the cursor, oldest first", async () => {
    const anna = randomUUID();
    const cursorId = randomUUID();
    const laterId = randomUUID();
    const latestId = randomUUID();
    await seed(db, anna, "2026-11-01T10:00:00Z", cursorId);
    await seed(db, anna, "2026-11-03T10:00:00Z", latestId);
    await seed(db, anna, "2026-11-02T10:00:00Z", laterId);

    const result = await readMissedNotifications(db.db, anna, cursorId);

    expect(result.kind).toBe("replay");
    if (result.kind === "replay") {
      expect(idsOf(result.notices)).toEqual([laterId, latestId]);
    }
  });

  it("orders notices with the same createdAt by notification id", async () => {
    const anna = randomUUID();
    const [lowId, highId] = [randomUUID(), randomUUID()].sort();
    const sameTime = "2026-11-01T10:00:00Z";
    await seed(db, anna, sameTime, highId);
    await seed(db, anna, sameTime, lowId);

    const fromLow = await readMissedNotifications(db.db, anna, lowId);
    const fromHigh = await readMissedNotifications(db.db, anna, highId);

    expect(fromLow).toEqual({
      kind: "replay",
      notices: [expect.objectContaining({ id: highId })],
    });
    expect(fromHigh).toEqual({ kind: "replay", notices: [] });
  });

  it("returns an empty replay when the cursor is the newest notice", async () => {
    const anna = randomUUID();
    const newestId = randomUUID();
    await seed(db, anna, "2026-11-01T10:00:00Z");
    await seed(db, anna, "2026-11-02T10:00:00Z", newestId);

    await expect(readMissedNotifications(db.db, anna, newestId)).resolves.toEqual({
      kind: "replay",
      notices: [],
    });
  });

  it("resets when the cursor id is unknown", async () => {
    const anna = randomUUID();
    await seed(db, anna, "2026-11-01T10:00:00Z");

    await expect(readMissedNotifications(db.db, anna, randomUUID())).resolves.toEqual({
      kind: "reset",
    });
  });

  it("resets when the cursor belongs to another person, and never shows their notices", async () => {
    const anna = randomUUID();
    const tom = randomUUID();
    const tomsCursorId = randomUUID();
    await seed(db, tom, "2026-11-01T10:00:00Z", tomsCursorId);
    await seed(db, tom, "2026-11-02T10:00:00Z");
    await seed(db, anna, "2026-11-03T10:00:00Z");

    await expect(readMissedNotifications(db.db, anna, tomsCursorId)).resolves.toEqual({
      kind: "reset",
    });
  });

  it("replays exactly the cap of newer notices", async () => {
    const anna = randomUUID();
    const cursorId = randomUUID();
    await seed(db, anna, secondsAfterBase(0), cursorId);
    for (let index = 1; index <= MAX_REPLAY_NOTICES; index += 1) {
      await seed(db, anna, secondsAfterBase(index));
    }

    const result = await readMissedNotifications(db.db, anna, cursorId);

    expect(result.kind).toBe("replay");
    if (result.kind === "replay") {
      expect(result.notices).toHaveLength(MAX_REPLAY_NOTICES);
    }
  });

  it("resets when there are more newer notices than the cap", async () => {
    const anna = randomUUID();
    const cursorId = randomUUID();
    await seed(db, anna, secondsAfterBase(0), cursorId);
    for (let index = 1; index <= MAX_REPLAY_NOTICES + 1; index += 1) {
      await seed(db, anna, secondsAfterBase(index));
    }

    await expect(readMissedNotifications(db.db, anna, cursorId)).resolves.toEqual({
      kind: "reset",
    });
  });
});
