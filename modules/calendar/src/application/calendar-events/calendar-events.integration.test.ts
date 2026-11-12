// SPDX-FileCopyrightText: 2026 Dominik Wadowski
// SPDX-License-Identifier: FSL-1.1-ALv2

import { randomUUID } from "node:crypto";
import { withUserContext } from "@offgrid/db";
import { afterAll, beforeAll, beforeEach, describe, expect, it } from "vitest";
import { startCalendarTestDatabase } from "../../../test/start-calendar-test-database.js";
import type { CalendarTestDatabase } from "../../../test/types.js";
import { applyFamilyMembership } from "../../events/family-membership/apply-family-membership.js";
import { publishCalendarEventCreated } from "../../events/calendar-events/publish-calendar-event-created.js";
import { insertEvent } from "../../infrastructure/calendar-events/insert-event.js";
import { createCalendarEvent } from "./create-calendar-event.js";
import { getCalendarEvent } from "./get-calendar-event.js";
import { listCalendarEvents } from "./list-calendar-events.js";
import { removeCalendarEvent } from "./remove-calendar-event.js";
import { getTimeZone, setTimeZone } from "../time-zone/time-zone-settings.js";

describe("calendar events use cases", { timeout: 60_000 }, () => {
  let db: CalendarTestDatabase;

  beforeAll(async () => {
    db = await startCalendarTestDatabase();
  }, 120_000);

  afterAll(async () => {
    await db.stop();
  }, 120_000);

  beforeEach(async () => {
    await db.reset();
    await db.admin.query("TRUNCATE outbox.event");
  });

  const joinFamily = (familyId: string, userId: string) =>
    db.db.$transaction((tx) =>
      applyFamilyMembership(tx, { familyId, userId, sourceVersion: 1, isMember: true }),
    );

  const insertPersonalCalendar = async (userId: string, name: string) => {
    const calendarId = randomUUID();
    await db.admin.query(
      "INSERT INTO calendar.calendar (calendar_id, user_id, name, color) VALUES ($1, $2, $3, 'blue')",
      [calendarId, userId, name],
    );
    return calendarId;
  };

  const insertFamilyCalendar = async (familyId: string, name: string) => {
    const calendarId = randomUUID();
    await db.admin.query(
      "INSERT INTO calendar.calendar (calendar_id, family_id, name, color) VALUES ($1, $2, $3, 'green')",
      [calendarId, familyId, name],
    );
    return calendarId;
  };

  const storedEvents = async () => {
    const { rows } = await db.admin.query<{
      event_id: string;
      starts_at: Date;
      ends_at: Date;
      version: number;
    }>("SELECT event_id, starts_at, ends_at, version FROM calendar.calendar_event");
    return rows;
  };

  const outboxEvents = async (type: string) => {
    const { rows } = await db.admin.query<{
      type: string;
      source_version: string;
      payload: Record<string, unknown>;
    }>("SELECT type, source_version, payload FROM outbox.event WHERE type = $1 ORDER BY sequence", [
      type,
    ]);
    return rows;
  };

  const timed = {
    title: "Standup",
    isAllDay: false as const,
    startsAt: "2026-11-20T09:00:00Z",
    endsAt: "2026-11-20T09:30:00Z",
  };

  it("stores a timed event in UTC and publishes it with version 1", async () => {
    const anna = randomUUID();
    const work = await insertPersonalCalendar(anna, "Work");

    const outcome = await createCalendarEvent(db.db, anna, work, timed);

    expect(outcome.outcome).toBe("found");
    const [stored] = await storedEvents();
    expect(stored?.starts_at.toISOString()).toBe("2026-11-20T09:00:00.000Z");
    expect(stored?.ends_at.toISOString()).toBe("2026-11-20T09:30:00.000Z");
    expect(stored?.version).toBe(1);
    const [published] = await outboxEvents("calendar-event-created-v1");
    expect(published?.source_version).toBe("1");
    expect(published?.payload).toMatchObject({ title: "Standup", version: 1 });
  });

  it("stores an all-day event in the caller's time zone", async () => {
    const anna = randomUUID();
    const work = await insertPersonalCalendar(anna, "Work");
    await setTimeZone(db.db, anna, "Europe/Warsaw");

    const outcome = await createCalendarEvent(db.db, anna, work, {
      title: "Conference",
      isAllDay: true,
      startDate: "2026-11-20",
      endDate: "2026-11-20",
    });

    expect(outcome.outcome).toBe("found");
    const [stored] = await storedEvents();
    expect(stored?.starts_at.toISOString()).toBe("2026-11-19T23:00:00.000Z");
    expect(stored?.ends_at.toISOString()).toBe("2026-11-20T23:00:00.000Z");
    if (outcome.outcome === "found") {
      expect(outcome.value).toMatchObject({
        isAllDay: true,
        startDate: "2026-11-20",
        endDate: "2026-11-20",
      });
    }
  });

  it("reports the time zone as unset until the person sets it", async () => {
    const anna = randomUUID();

    expect(await getTimeZone(db.db, anna)).toEqual({ timeZone: "UTC", isSet: false });
    expect(await setTimeZone(db.db, anna, "Europe/Warsaw")).toEqual({
      timeZone: "Europe/Warsaw",
      isSet: true,
    });
    expect(await getTimeZone(db.db, anna)).toEqual({ timeZone: "Europe/Warsaw", isSet: true });
  });

  it("lets a family member create an event in a family calendar that another member sees", async () => {
    const anna = randomUUID();
    const ben = randomUUID();
    const home = randomUUID();
    await joinFamily(home, anna);
    await joinFamily(home, ben);
    const kitchen = await insertFamilyCalendar(home, "Kitchen");

    await createCalendarEvent(db.db, ben, kitchen, { ...timed, title: "Dinner" });
    const seen = await listCalendarEvents(db.db, anna, kitchen);

    expect(seen.outcome === "found" ? seen.value.map((event) => event.title) : []).toEqual([
      "Dinner",
    ]);
  });

  it("answers not-found for a calendar and an event a person cannot see", async () => {
    const anna = randomUUID();
    const carol = randomUUID();
    const home = randomUUID();
    await joinFamily(home, anna);
    const kitchen = await insertFamilyCalendar(home, "Kitchen");
    const gym = await insertPersonalCalendar(carol, "Gym");
    const created = await createCalendarEvent(db.db, carol, gym, timed);
    if (created.outcome !== "found") {
      throw new Error("the owner must be able to create the event");
    }
    const eventId = created.value.eventId;

    expect((await listCalendarEvents(db.db, anna, gym)).outcome).toBe("not-found");
    expect((await createCalendarEvent(db.db, anna, gym, timed)).outcome).toBe("not-found");
    expect((await getCalendarEvent(db.db, anna, eventId)).outcome).toBe("not-found");
    expect((await removeCalendarEvent(db.db, anna, eventId)).outcome).toBe("not-found");
    expect((await listCalendarEvents(db.db, anna, kitchen)).outcome).toBe("found");
    expect(await storedEvents()).toHaveLength(1);
  });

  it("removes an event and publishes it with the next source version", async () => {
    const anna = randomUUID();
    const work = await insertPersonalCalendar(anna, "Work");
    const created = await createCalendarEvent(db.db, anna, work, timed);
    if (created.outcome !== "found") {
      throw new Error("the owner must be able to create the event");
    }

    const removed = await removeCalendarEvent(db.db, anna, created.value.eventId);

    expect(removed.outcome).toBe("found");
    expect(await storedEvents()).toEqual([]);
    const [published] = await outboxEvents("calendar-event-removed-v1");
    expect(published?.source_version).toBe("2");
  });

  it("publishes nothing and stores nothing when the transaction rolls back", async () => {
    const anna = randomUUID();
    const work = await insertPersonalCalendar(anna, "Work");

    await expect(
      db.db.$transaction(async (tx) => {
        await withUserContext(tx, anna);
        const record = await insertEvent(tx, {
          eventId: randomUUID(),
          calendarId: work,
          userId: anna,
          title: "Rolled back",
          location: null,
          description: null,
          isAllDay: false,
          startsAt: new Date("2026-11-20T09:00:00Z"),
          endsAt: new Date("2026-11-20T09:30:00Z"),
        });
        await publishCalendarEventCreated(tx, record);
        throw new Error("forced rollback");
      }),
    ).rejects.toThrow("forced rollback");

    expect(await storedEvents()).toEqual([]);
    expect(await outboxEvents("calendar-event-created-v1")).toEqual([]);
  });
});
