// SPDX-FileCopyrightText: 2026 Dominik Wadowski
// SPDX-License-Identifier: FSL-1.1-ALv2

import { randomUUID } from "node:crypto";
import { afterAll, beforeAll, beforeEach, describe, expect, it } from "vitest";
import { startCalendarTestDatabase } from "../../../test/start-calendar-test-database.js";
import type { CalendarTestDatabase } from "../../../test/types.js";
import { createCalendarEvent } from "../../application/calendar-events/create-calendar-event.js";
import { removeCalendarEvent } from "../../application/calendar-events/remove-calendar-event.js";
import { claimDueReminders } from "../../infrastructure/reminders/claim-due-reminders.js";
import { runReminderTick } from "./run-reminder-tick.js";

// The event starts at 09:00 UTC and the reminders are 15 and 60 minutes before it, so they are
// due at 08:45 and 08:00. The fake clock is the `now` passed to each tick.
const seededAt = new Date("2026-11-20T07:00:00Z");
const starts = "2026-11-20T09:00:00Z";
const BATCH = 50;

describe("reminder dispatch tick with a fake clock", { timeout: 60_000 }, () => {
  let db: CalendarTestDatabase;
  let userId: string;
  let calendarId: string;

  beforeAll(async () => {
    db = await startCalendarTestDatabase();
  }, 120_000);

  afterAll(async () => {
    await db.stop();
  }, 120_000);

  beforeEach(async () => {
    await db.reset();
    await db.admin.query("TRUNCATE outbox.event");
    userId = randomUUID();
    calendarId = randomUUID();
    await db.admin.query(
      "INSERT INTO calendar.calendar (calendar_id, user_id, name, color) VALUES ($1, $2, 'Work', 'blue')",
      [calendarId, userId],
    );
  });

  const addStandup = async (offsets: number[], title = "Standup") => {
    const outcome = await createCalendarEvent(
      db.db,
      userId,
      calendarId,
      {
        title,
        isAllDay: false,
        startsAt: starts,
        endsAt: "2026-11-20T09:30:00Z",
        reminderOffsetsMinutes: offsets,
      },
      seededAt,
    );
    if (outcome.outcome !== "found") {
      throw new Error("event was not created");
    }
    return outcome.value.eventId;
  };

  const tick = (now: string, batch = BATCH) =>
    runReminderTick(db.db, { now: new Date(now), batch });

  const factCount = async () => {
    const { rows } = await db.admin.query(
      "SELECT 1 FROM outbox.event WHERE type = 'calendar-reminder-due-v1'",
    );
    return rows.length;
  };

  it("fires a reminder once at its time and not again on a later tick", async () => {
    await addStandup([15]);
    expect(await tick("2026-11-20T08:44:59.999Z")).toBe(0);
    expect(await tick("2026-11-20T08:45:00Z")).toBe(1);
    expect(await tick("2026-11-20T08:50:00Z")).toBe(0);
    expect(await factCount()).toBe(1);
  });

  it("publishes a fact whose payload is the event and the creator", async () => {
    const eventId = await addStandup([15]);
    await tick("2026-11-20T08:45:00Z");
    const { rows } = await db.admin.query<{ payload: unknown; user_id: string }>(
      "SELECT payload, user_id FROM outbox.event WHERE type = 'calendar-reminder-due-v1'",
    );
    expect(rows[0].payload).toEqual({ eventId, userId });
    expect(rows[0].user_id).toBe(userId);
  });

  it("fires each offset of an event separately", async () => {
    await addStandup([15, 60]);
    expect(await tick("2026-11-20T08:00:00Z")).toBe(1);
    expect(await tick("2026-11-20T08:45:00Z")).toBe(1);
    expect(await factCount()).toBe(2);
  });

  it("fires nothing for a deleted event", async () => {
    const eventId = await addStandup([15]);
    await removeCalendarEvent(db.db, userId, eventId);
    expect(await tick("2026-11-20T08:45:00Z")).toBe(0);
    expect(await factCount()).toBe(0);
  });

  it("fires a reminder that became due during downtime once, at the next tick", async () => {
    await addStandup([15, 60]);
    expect(await tick("2026-11-20T09:30:00Z")).toBe(2);
    expect(await tick("2026-11-20T09:31:00Z")).toBe(0);
    expect(await factCount()).toBe(2);
  });

  it("produces one fact per reminder when two ticks run at the same time", async () => {
    await addStandup([15]);
    await addStandup([15], "Review");
    const counts = await Promise.all([tick("2026-11-20T08:45:00Z"), tick("2026-11-20T08:45:00Z")]);
    expect(counts[0] + counts[1]).toBe(2);
    expect(await factCount()).toBe(2);
  });

  it("leaves no fired marker and no fact when the transaction rolls back", async () => {
    await addStandup([15]);
    await expect(
      db.db.$transaction(async (tx) => {
        const claimed = await claimDueReminders(tx, new Date("2026-11-20T08:45:00Z"), BATCH);
        expect(claimed).toHaveLength(1);
        throw new Error("publish failed");
      }),
    ).rejects.toThrow("publish failed");
    const { rows } = await db.admin.query(
      "SELECT 1 FROM calendar.event_reminder WHERE fired_at IS NULL",
    );
    expect(rows).toHaveLength(1);
    expect(await factCount()).toBe(0);
    expect(await tick("2026-11-20T08:45:00Z")).toBe(1);
  });

  it("skips a reminder that was set in the past and never fires it", async () => {
    await createCalendarEvent(
      db.db,
      userId,
      calendarId,
      {
        title: "Soon",
        isAllDay: false,
        startsAt: "2026-11-15T08:05:00Z",
        endsAt: "2026-11-15T08:30:00Z",
        reminderOffsetsMinutes: [15],
      },
      new Date("2026-11-15T08:00:00Z"),
    );
    expect(await tick("2026-11-15T08:10:00Z")).toBe(0);
    expect(await factCount()).toBe(0);
  });
});
