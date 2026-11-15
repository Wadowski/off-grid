// SPDX-FileCopyrightText: 2026 Dominik Wadowski
// SPDX-License-Identifier: FSL-1.1-ALv2

import { randomUUID } from "node:crypto";
import { withUserContext } from "@offgrid/db";
import { afterAll, beforeAll, beforeEach, describe, expect, it } from "vitest";
import { startCalendarTestDatabase } from "../../../test/start-calendar-test-database.js";
import type { CalendarTestDatabase } from "../../../test/types.js";
import { insertEvent } from "../calendar-events/insert-event.js";
import { replaceEventReminders } from "./replace-event-reminders.js";

describe("replaceEventReminders", { timeout: 60_000 }, () => {
  let db: CalendarTestDatabase;
  let userId: string;
  let eventId: string;
  const startsAt = new Date("2026-11-20T09:00:00Z");
  const beforeStart = new Date("2026-11-20T08:00:00Z");

  beforeAll(async () => {
    db = await startCalendarTestDatabase();
  }, 120_000);

  afterAll(async () => {
    await db.stop();
  }, 120_000);

  beforeEach(async () => {
    await db.reset();
    userId = randomUUID();
    eventId = randomUUID();
    const calendarId = randomUUID();
    await db.admin.query(
      "INSERT INTO calendar.calendar (calendar_id, user_id, name, color) VALUES ($1, $2, 'Work', 'blue')",
      [calendarId, userId],
    );
    await db.db.$transaction(async (tx) => {
      await withUserContext(tx, userId);
      await insertEvent(tx, {
        eventId,
        calendarId,
        userId,
        familyId: undefined,
        title: "Standup",
        location: null,
        description: null,
        isAllDay: false,
        startsAt,
        endsAt: new Date("2026-11-20T09:30:00Z"),
      });
    });
  });

  const reconcile = (
    offsetsMinutes: readonly number[],
    options: { readonly at?: Date; readonly now?: Date; readonly as?: string } = {},
  ) =>
    db.db.$transaction(async (tx) => {
      await withUserContext(tx, options.as ?? userId);
      await replaceEventReminders(tx, {
        eventId,
        familyId: null,
        userId: options.as ?? userId,
        startsAt: options.at ?? startsAt,
        offsetsMinutes,
        now: options.now ?? beforeStart,
      });
    });

  const rowsOf = (as = userId) =>
    db.db.$transaction(async (tx) => {
      await withUserContext(tx, as);
      return tx.eventReminder.findMany({
        where: { eventId },
        orderBy: { offsetMinutes: "asc" },
      });
    });

  it("creates one row per offset with its time", async () => {
    await reconcile([15, 60]);
    const rows = await rowsOf();
    expect(rows.map((row) => [row.offsetMinutes, row.remindAt.toISOString()])).toEqual([
      [15, "2026-11-20T08:45:00.000Z"],
      [60, "2026-11-20T08:00:00.000Z"],
    ]);
    expect(rows.every((row) => row.firedAt === null && row.skippedAt === null)).toBe(true);
  });

  it("skips offsets whose time is already in the past", async () => {
    await reconcile([15, 60], { now: new Date("2026-11-20T08:50:00Z") });
    const rows = await rowsOf();
    expect(rows.map((row) => row.skippedAt?.toISOString())).toEqual([
      "2026-11-20T08:50:00.000Z",
      "2026-11-20T08:50:00.000Z",
    ]);
  });

  it("adds and removes offsets", async () => {
    await reconcile([15]);
    await reconcile([15, 60]);
    await reconcile([60]);
    expect((await rowsOf()).map((row) => row.offsetMinutes)).toEqual([60]);
  });

  it("removes every row when the offset list is empty", async () => {
    await reconcile([15, 60]);
    await reconcile([]);
    expect(await rowsOf()).toEqual([]);
  });

  it("reschedules a changed time and clears its fired marker", async () => {
    await reconcile([15]);
    await db.admin.query("UPDATE calendar.event_reminder SET fired_at = now()");
    await reconcile([15], { at: new Date("2026-11-20T10:00:00Z") });
    const [row] = await rowsOf();
    expect(row.remindAt.toISOString()).toBe("2026-11-20T09:45:00.000Z");
    expect(row.firedAt).toBeNull();
  });

  it("keeps the fired marker when the time did not change", async () => {
    await reconcile([15]);
    await db.admin.query("UPDATE calendar.event_reminder SET fired_at = now()");
    await reconcile([15]);
    const [row] = await rowsOf();
    expect(row.firedAt).not.toBeNull();
  });

  it("marks a rescheduled reminder skipped when its new time is in the past", async () => {
    await reconcile([15]);
    await reconcile([15], {
      at: new Date("2026-11-20T08:10:00Z"),
      now: new Date("2026-11-20T08:05:00Z"),
    });
    const [row] = await rowsOf();
    expect(row.skippedAt?.toISOString()).toBe("2026-11-20T08:05:00.000Z");
  });

  it("does not touch another user's rows for the same event", async () => {
    const otherUserId = randomUUID();
    await db.admin.query(
      "INSERT INTO calendar.event_reminder (reminder_id, event_id, user_id, remind_at, offset_minutes) VALUES ($1, $2, $3, '2026-11-20T08:45:00Z', 15)",
      [randomUUID(), eventId, otherUserId],
    );
    await reconcile([]);
    const { rows } = await db.admin.query(
      "SELECT 1 FROM calendar.event_reminder WHERE user_id = $1",
      [otherUserId],
    );
    expect(rows).toHaveLength(1);
  });
});
