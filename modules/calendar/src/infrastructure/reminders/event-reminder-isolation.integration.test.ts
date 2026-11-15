// SPDX-FileCopyrightText: 2026 Dominik Wadowski
// SPDX-License-Identifier: FSL-1.1-ALv2

import { randomUUID } from "node:crypto";
import { withUserContext } from "@offgrid/db";
import { afterAll, beforeAll, beforeEach, describe, expect, it } from "vitest";
import { startCalendarTestDatabase } from "../../../test/start-calendar-test-database.js";
import type { CalendarTestDatabase } from "../../../test/types.js";
import { createCalendarEvent } from "../../application/calendar-events/create-calendar-event.js";
import { applyFamilyMembership } from "../../events/family-membership/apply-family-membership.js";

describe("event reminder isolation", { timeout: 60_000 }, () => {
  let db: CalendarTestDatabase;
  let anna: string;
  let tom: string;
  let familyId: string;
  let calendarId: string;
  let eventId: string;
  const now = new Date("2026-11-15T00:00:00Z");

  beforeAll(async () => {
    db = await startCalendarTestDatabase();
  }, 120_000);

  afterAll(async () => {
    await db.stop();
  }, 120_000);

  beforeEach(async () => {
    await db.reset();
    anna = randomUUID();
    tom = randomUUID();
    familyId = randomUUID();
    calendarId = randomUUID();
    await db.db.$transaction(async (tx) => {
      await applyFamilyMembership(tx, { familyId, userId: anna, sourceVersion: 1, isMember: true });
      await applyFamilyMembership(tx, { familyId, userId: tom, sourceVersion: 1, isMember: true });
    });
    await db.admin.query(
      "INSERT INTO calendar.calendar (calendar_id, family_id, name, color) VALUES ($1, $2, 'Family', 'green')",
      [calendarId, familyId],
    );
    const outcome = await createCalendarEvent(
      db.db,
      anna,
      calendarId,
      {
        title: "Dinner",
        isAllDay: false,
        startsAt: "2026-11-20T18:00:00Z",
        endsAt: "2026-11-20T19:00:00Z",
        reminderOffsetsMinutes: [30],
      },
      now,
    );
    if (outcome.outcome !== "found") {
      throw new Error("event was not created");
    }
    eventId = outcome.value.eventId;
  });

  const reminderRowsAs = (userId: string) =>
    db.db.$transaction(async (tx) => {
      await withUserContext(tx, userId);
      return tx.eventReminder.findMany({ where: { eventId } });
    });

  it("lets the creator read her own reminder", async () => {
    expect(await reminderRowsAs(anna)).toHaveLength(1);
  });

  it("hides a family member's reminder from another family member", async () => {
    expect(await reminderRowsAs(tom)).toHaveLength(0);
  });

  it("does not let another family member delete the reminder", async () => {
    await db.db.$transaction(async (tx) => {
      await withUserContext(tx, tom);
      await tx.eventReminder.deleteMany({ where: { eventId } });
    });
    expect(await reminderRowsAs(anna)).toHaveLength(1);
  });

  it("returns only the four id columns from the claim function", async () => {
    const rows = await db.db.$transaction(async (tx) => {
      await withUserContext(tx, tom);
      return tx.$queryRaw<Record<string, unknown>[]>`
        SELECT * FROM calendar.claim_due_reminders(${new Date("2026-11-20T18:00:00Z")}::timestamptz, 10::integer)`;
    });
    expect(rows).toHaveLength(1);
    expect(Object.keys(rows[0]).sort()).toEqual(["event_id", "reminder_id", "user_id"]);
  });

  it("does not claim a reminder whose owner has left the family", async () => {
    await db.admin.query(
      "INSERT INTO calendar.event_reminder (reminder_id, event_id, user_id, remind_at, offset_minutes) VALUES ($1, $2, $3, '2026-11-20T17:30:00Z', 30)",
      [randomUUID(), eventId, tom],
    );
    await db.db.$transaction((tx) =>
      applyFamilyMembership(tx, { familyId, userId: tom, sourceVersion: 2, isMember: false }),
    );
    const rows = await db.db.$transaction(async (tx) => {
      await withUserContext(tx, anna);
      return tx.$queryRaw<Record<string, unknown>[]>`
        SELECT * FROM calendar.claim_due_reminders(${new Date("2026-11-20T18:00:00Z")}::timestamptz, 10::integer)`;
    });
    expect(rows.map((row) => row.user_id)).toEqual([anna]);
  });
});
