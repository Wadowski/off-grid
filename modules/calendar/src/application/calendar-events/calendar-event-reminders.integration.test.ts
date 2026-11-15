// SPDX-FileCopyrightText: 2026 Dominik Wadowski
// SPDX-License-Identifier: FSL-1.1-ALv2

import { randomUUID } from "node:crypto";
import { afterAll, beforeAll, beforeEach, describe, expect, it } from "vitest";
import { startCalendarTestDatabase } from "../../../test/start-calendar-test-database.js";
import type { CalendarTestDatabase } from "../../../test/types.js";
import { createCalendarEvent } from "./create-calendar-event.js";
import { removeCalendarEvent } from "./remove-calendar-event.js";
import { updateCalendarEvent } from "./update-calendar-event.js";
import { applyFamilyMembership } from "../../events/family-membership/apply-family-membership.js";

describe("calendar event reminders", { timeout: 60_000 }, () => {
  let db: CalendarTestDatabase;
  let userId: string;
  let calendarId: string;
  const now = new Date("2026-11-15T00:00:00Z");

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
    calendarId = await insertPersonalCalendar(userId, "Work");
  });

  const insertPersonalCalendar = async (owner: string, name: string) => {
    const id = randomUUID();
    await db.admin.query(
      "INSERT INTO calendar.calendar (calendar_id, user_id, name, color) VALUES ($1, $2, $3, 'blue')",
      [id, owner, name],
    );
    return id;
  };

  const standup = {
    title: "Standup",
    isAllDay: false as const,
    startsAt: "2026-11-20T09:00:00Z",
    endsAt: "2026-11-20T09:30:00Z",
  };

  const createStandup = async (reminderOffsetsMinutes?: number[]) => {
    const outcome = await createCalendarEvent(
      db.db,
      userId,
      calendarId,
      { ...standup, reminderOffsetsMinutes },
      now,
    );
    if (outcome.outcome !== "found") {
      throw new Error("event was not created");
    }
    return outcome.value.eventId;
  };

  const shareFamilyWith = async (host: string) => {
    const familyId = randomUUID();
    const guest = randomUUID();
    await db.db.$transaction(async (tx) => {
      await applyFamilyMembership(tx, { familyId, userId: host, sourceVersion: 1, isMember: true });
      await applyFamilyMembership(tx, {
        familyId,
        userId: guest,
        sourceVersion: 1,
        isMember: true,
      });
    });
    return guest;
  };

  const reminderRows = async (eventId: string) => {
    const { rows } = await db.admin.query<{
      offset_minutes: number;
      remind_at: Date;
      fired_at: Date | null;
    }>(
      "SELECT offset_minutes, remind_at, fired_at FROM calendar.event_reminder WHERE event_id = $1 ORDER BY offset_minutes",
      [eventId],
    );
    return rows;
  };

  it("stores one row per offset when the event is created", async () => {
    const eventId = await createStandup([15, 60]);
    expect((await reminderRows(eventId)).map((row) => row.offset_minutes)).toEqual([15, 60]);
  });

  it("returns the caller's own offsets with the event", async () => {
    const eventId = await createStandup([60, 15]);
    const outcome = await updateCalendarEvent(db.db, userId, eventId, { title: "Standup 2" }, now);
    expect(outcome.outcome === "found" && outcome.value.reminderOffsetsMinutes).toEqual([15, 60]);
  });

  it("reschedules the rows when the start moves", async () => {
    const eventId = await createStandup([15]);
    await updateCalendarEvent(
      db.db,
      userId,
      eventId,
      { startsAt: "2026-11-20T10:00:00Z", endsAt: "2026-11-20T10:30:00Z" },
      now,
    );
    const [row] = await reminderRows(eventId);
    expect(row.remind_at.toISOString()).toBe("2026-11-20T09:45:00.000Z");
  });

  it("keeps the fired marker when only the title changes", async () => {
    const eventId = await createStandup([15]);
    await db.admin.query("UPDATE calendar.event_reminder SET fired_at = now()");
    await updateCalendarEvent(db.db, userId, eventId, { title: "Renamed" }, now);
    const [row] = await reminderRows(eventId);
    expect(row.fired_at).not.toBeNull();
  });

  it("adds and removes rows when the offsets change", async () => {
    const eventId = await createStandup([15]);
    await updateCalendarEvent(db.db, userId, eventId, { reminderOffsetsMinutes: [60] }, now);
    expect((await reminderRows(eventId)).map((row) => row.offset_minutes)).toEqual([60]);
  });

  it("clears all rows when the offsets are sent as an empty list", async () => {
    const eventId = await createStandup([15, 60]);
    await updateCalendarEvent(db.db, userId, eventId, { reminderOffsetsMinutes: [] }, now);
    expect(await reminderRows(eventId)).toEqual([]);
  });

  it("keeps the rows and their times when the event moves to another calendar", async () => {
    const eventId = await createStandup([15]);
    const otherCalendarId = await insertPersonalCalendar(userId, "Home");
    await updateCalendarEvent(db.db, userId, eventId, { calendarId: otherCalendarId }, now);
    const [row] = await reminderRows(eventId);
    expect(row.remind_at.toISOString()).toBe("2026-11-20T08:45:00.000Z");
  });

  it("lets a guest set their own reminders on the host's event without changing the event", async () => {
    const eventId = await createStandup();
    const guestId = await shareFamilyWith(userId);
    await db.admin.query(
      "INSERT INTO calendar.event_guest (event_id, guest_user_id, user_id) VALUES ($1, $2, $3)",
      [eventId, guestId, userId],
    );
    const outcome = await updateCalendarEvent(
      db.db,
      guestId,
      eventId,
      { reminderOffsetsMinutes: [30] },
      now,
    );
    expect(outcome.outcome === "found" && outcome.value.reminderOffsetsMinutes).toEqual([30]);
    const { rows } = await db.admin.query<{ user_id: string }>(
      "SELECT user_id FROM calendar.event_reminder WHERE event_id = $1",
      [eventId],
    );
    expect(rows).toEqual([{ user_id: guestId }]);
  });

  it("refuses a guest's change to the event fields", async () => {
    const eventId = await createStandup();
    const guestId = await shareFamilyWith(userId);
    await db.admin.query(
      "INSERT INTO calendar.event_guest (event_id, guest_user_id, user_id) VALUES ($1, $2, $3)",
      [eventId, guestId, userId],
    );
    await expect(
      updateCalendarEvent(db.db, guestId, eventId, { title: "Changed" }, now),
    ).rejects.toThrow();
  });

  it("removes the rows when the event is deleted", async () => {
    const eventId = await createStandup([15, 60]);
    await removeCalendarEvent(db.db, userId, eventId);
    const { rows } = await db.admin.query(
      "SELECT 1 FROM calendar.event_reminder WHERE event_id = $1",
      [eventId],
    );
    expect(rows).toHaveLength(0);
  });
});
