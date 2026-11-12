// SPDX-FileCopyrightText: 2026 Dominik Wadowski
// SPDX-License-Identifier: FSL-1.1-ALv2

import { randomUUID } from "node:crypto";
import { withUserContext } from "@offgrid/db";
import { afterAll, beforeAll, beforeEach, describe, expect, it } from "vitest";
import { startCalendarTestDatabase } from "../../../test/start-calendar-test-database.js";
import type { CalendarTestDatabase } from "../../../test/types.js";
import { applyFamilyMembership } from "../../events/family-membership/apply-family-membership.js";
import { listEventsOverlapping } from "./list-events-overlapping.js";

const at = (iso: string): Date => new Date(iso);

describe("listEventsOverlapping", { timeout: 60_000 }, () => {
  let db: CalendarTestDatabase;
  const range = { startsAt: at("2026-11-16T00:00:00Z"), endsAt: at("2026-11-23T00:00:00Z") };

  beforeAll(async () => {
    db = await startCalendarTestDatabase();
  }, 120_000);

  afterAll(async () => {
    await db.stop();
  }, 120_000);

  beforeEach(async () => {
    await db.reset();
  });

  const insertCalendar = async (
    owner: { userId: string } | { familyId: string },
    name: string,
    color: string,
  ): Promise<string> => {
    const calendarId = randomUUID();
    const userId = "userId" in owner ? owner.userId : null;
    const familyId = "familyId" in owner ? owner.familyId : null;
    await db.admin.query(
      "INSERT INTO calendar.calendar (calendar_id, user_id, family_id, name, color) VALUES ($1, $2, $3, $4, $5)",
      [calendarId, userId, familyId, name, color],
    );
    return calendarId;
  };

  const insertEvent = async (
    calendarId: string,
    title: string,
    startsAt: string,
    endsAt: string,
  ): Promise<string> => {
    const eventId = randomUUID();
    await db.admin.query(
      `INSERT INTO calendar.calendar_event (event_id, calendar_id, family_id, user_id, title, starts_at, ends_at)
       SELECT $1, calendar_id, family_id, user_id, $3, $4, $5 FROM calendar.calendar WHERE calendar_id = $2`,
      [eventId, calendarId, title, startsAt, endsAt],
    );
    return eventId;
  };

  const overlappingFor = (userId: string, window = range) =>
    db.db.$transaction(async (tx) => {
      await withUserContext(tx, userId);
      return listEventsOverlapping(tx, window);
    });

  const titlesFor = async (userId: string, window = range) =>
    (await overlappingFor(userId, window)).map((event) => event.title);

  it("includes an event that overlaps the range and excludes one that ends at the range start", async () => {
    const userId = randomUUID();
    const calendarId = await insertCalendar({ userId }, "Work", "blue");
    await insertEvent(calendarId, "Spanning", "2026-11-15T22:00:00Z", "2026-11-16T01:00:00Z");
    await insertEvent(calendarId, "Ends at start", "2026-11-15T20:00:00Z", "2026-11-16T00:00:00Z");

    expect(await titlesFor(userId)).toEqual(["Spanning"]);
  });

  it("excludes an event that starts exactly at the range end", async () => {
    const userId = randomUUID();
    const calendarId = await insertCalendar({ userId }, "Work", "blue");
    await insertEvent(calendarId, "Starts at end", "2026-11-23T00:00:00Z", "2026-11-23T01:00:00Z");

    expect(await titlesFor(userId)).toEqual([]);
  });

  it("includes a zero-length event inside the range and excludes one at the range end", async () => {
    const userId = randomUUID();
    const calendarId = await insertCalendar({ userId }, "Work", "blue");
    await insertEvent(calendarId, "Instant", "2026-11-18T10:00:00Z", "2026-11-18T10:00:00Z");
    await insertEvent(calendarId, "Instant at end", "2026-11-23T00:00:00Z", "2026-11-23T00:00:00Z");

    expect(await titlesFor(userId)).toEqual(["Instant"]);
  });

  it("includes a zero-length event at the range start", async () => {
    const userId = randomUUID();
    const calendarId = await insertCalendar({ userId }, "Work", "blue");
    await insertEvent(
      calendarId,
      "Instant at start",
      "2026-11-16T00:00:00Z",
      "2026-11-16T00:00:00Z",
    );

    expect(await titlesFor(userId)).toEqual(["Instant at start"]);
  });

  it("returns the calendar name and color with each event", async () => {
    const userId = randomUUID();
    const calendarId = await insertCalendar({ userId }, "Work", "amber");
    await insertEvent(calendarId, "Standup", "2026-11-18T09:00:00Z", "2026-11-18T09:30:00Z");

    const [event] = await overlappingFor(userId);

    expect(event?.calendarId).toBe(calendarId);
    expect(event?.calendarName).toBe("Work");
    expect(event?.calendarColor).toBe("amber");
  });

  it("orders events by start and then by event id", async () => {
    const userId = randomUUID();
    const calendarId = await insertCalendar({ userId }, "Work", "blue");
    const later = await insertEvent(
      calendarId,
      "Later",
      "2026-11-18T12:00:00Z",
      "2026-11-18T13:00:00Z",
    );
    const earlier = await insertEvent(
      calendarId,
      "Earlier",
      "2026-11-18T09:00:00Z",
      "2026-11-18T10:00:00Z",
    );

    const ids = (await overlappingFor(userId)).map((event) => event.eventId);

    expect(ids).toEqual([earlier, later]);
  });

  it("hides another person's personal calendar", async () => {
    const owner = randomUUID();
    const stranger = randomUUID();
    const calendarId = await insertCalendar({ userId: owner }, "Private", "violet");
    await insertEvent(calendarId, "Secret", "2026-11-18T09:00:00Z", "2026-11-18T10:00:00Z");

    expect(await titlesFor(owner)).toEqual(["Secret"]);
    expect(await titlesFor(stranger)).toEqual([]);
  });

  it("hides a family calendar from a person who is not a member", async () => {
    const familyId = randomUUID();
    const member = randomUUID();
    const outsider = randomUUID();
    const calendarId = await insertCalendar({ familyId }, "Kitchen", "teal");
    await insertEvent(calendarId, "Dinner", "2026-11-18T18:00:00Z", "2026-11-18T19:00:00Z");
    await db.db.$transaction((tx) =>
      applyFamilyMembership(tx, { familyId, userId: member, sourceVersion: 1, isMember: true }),
    );

    expect(await titlesFor(member)).toEqual(["Dinner"]);
    expect(await titlesFor(outsider)).toEqual([]);
  });

  it("hides a family calendar once the person's membership is removed", async () => {
    const familyId = randomUUID();
    const member = randomUUID();
    const calendarId = await insertCalendar({ familyId }, "Kitchen", "teal");
    await insertEvent(calendarId, "Dinner", "2026-11-18T18:00:00Z", "2026-11-18T19:00:00Z");
    await db.db.$transaction((tx) =>
      applyFamilyMembership(tx, { familyId, userId: member, sourceVersion: 1, isMember: true }),
    );
    await db.db.$transaction((tx) =>
      applyFamilyMembership(tx, { familyId, userId: member, sourceVersion: 2, isMember: false }),
    );

    expect(await titlesFor(member)).toEqual([]);
  });
});
