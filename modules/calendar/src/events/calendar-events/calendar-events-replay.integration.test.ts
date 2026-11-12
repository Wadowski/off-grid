// SPDX-FileCopyrightText: 2026 Dominik Wadowski
// SPDX-License-Identifier: FSL-1.1-ALv2

import { randomUUID } from "node:crypto";
import {
  calendarEventCreatedV1,
  calendarEventRemovedV1,
  calendarEventUpdatedV1,
} from "@offgrid/contracts";
import { replayEvents } from "@offgrid/event-bus";
import { afterAll, beforeAll, beforeEach, describe, expect, it } from "vitest";
import { startCalendarTestDatabase } from "../../../test/start-calendar-test-database.js";
import type { CalendarTestDatabase } from "../../../test/types.js";
import { createCalendarEvent } from "../../application/calendar-events/create-calendar-event.js";
import { removeCalendarEvent } from "../../application/calendar-events/remove-calendar-event.js";
import { updateCalendarEvent } from "../../application/calendar-events/update-calendar-event.js";
import { EventMoveOwnerMismatchError } from "../../application/errors/event-move-owner-mismatch-error.js";
import { applyFamilyMembership } from "../family-membership/apply-family-membership.js";

interface Replayed {
  readonly type: string;
  readonly eventId: string;
  readonly sourceVersion: number;
}

describe("calendar event replay", { timeout: 60_000 }, () => {
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

  const insertPersonalCalendar = async (userId: string, name: string) => {
    const calendarId = randomUUID();
    await db.admin.query(
      "INSERT INTO calendar.calendar (calendar_id, user_id, name, color) VALUES ($1, $2, $3, 'blue')",
      [calendarId, userId, name],
    );
    return calendarId;
  };

  // Replays one event name through the event bus and returns what each handler saw.
  const replayName = async (
    definition:
      typeof calendarEventCreatedV1 | typeof calendarEventUpdatedV1 | typeof calendarEventRemovedV1,
  ): Promise<Replayed[]> => {
    const seen: Replayed[] = [];
    await replayEvents(
      {
        event: definition,
        runAs: "calendar",
        handler: async (event) => {
          const payload = event.payload as { eventId: string };
          seen.push({
            type: event.type,
            eventId: payload.eventId,
            sourceVersion: event.sourceVersion,
          });
        },
      },
      { pool: db.pool },
    );
    return seen;
  };

  const outboxOrder = async () => {
    const { rows } = await db.admin.query<{ type: string; source_version: string }>(
      "SELECT type, source_version FROM outbox.event ORDER BY sequence",
    );
    return rows.map((row) => ({ type: row.type, sourceVersion: Number(row.source_version) }));
  };

  it("replays one event's changes in order with the source versions 1 to 5", async () => {
    const anna = randomUUID();
    const work = await insertPersonalCalendar(anna, "Work");
    const home = await insertPersonalCalendar(anna, "Home");
    const created = await createCalendarEvent(db.db, anna, work, {
      title: "Standup",
      isAllDay: false,
      startsAt: "2026-11-20T09:00:00Z",
      endsAt: "2026-11-20T09:30:00Z",
    });
    if (created.outcome !== "found") {
      throw new Error("the owner must be able to create the event");
    }
    const eventId = created.value.eventId;
    await updateCalendarEvent(db.db, anna, eventId, { title: "Standup, moved" });
    await updateCalendarEvent(db.db, anna, eventId, { calendarId: home });
    await updateCalendarEvent(db.db, anna, eventId, { location: "Kitchen" });
    await removeCalendarEvent(db.db, anna, eventId);

    expect(await outboxOrder()).toEqual([
      { type: "calendar-event-created-v1", sourceVersion: 1 },
      { type: "calendar-event-updated-v1", sourceVersion: 2 },
      { type: "calendar-event-updated-v1", sourceVersion: 3 },
      { type: "calendar-event-updated-v1", sourceVersion: 4 },
      { type: "calendar-event-removed-v1", sourceVersion: 5 },
    ]);

    const replayed = [
      ...(await replayName(calendarEventCreatedV1)),
      ...(await replayName(calendarEventUpdatedV1)),
      ...(await replayName(calendarEventRemovedV1)),
    ];
    const ofEvent = replayed.filter((entry) => entry.eventId === eventId);
    expect(ofEvent.map((entry) => entry.sourceVersion).sort((a, b) => a - b)).toEqual([
      1, 2, 3, 4, 5,
    ]);
    expect(ofEvent.filter((entry) => entry.type === "calendar-event-updated-v1")).toHaveLength(3);
  });

  it("publishes nothing for a refused cross-owner move", async () => {
    const anna = randomUUID();
    const home = randomUUID();
    await db.db.$transaction((tx) =>
      applyFamilyMembership(tx, { familyId: home, userId: anna, sourceVersion: 1, isMember: true }),
    );
    const kitchen = randomUUID();
    await db.admin.query(
      "INSERT INTO calendar.calendar (calendar_id, family_id, name, color) VALUES ($1, $2, 'Kitchen', 'green')",
      [kitchen, home],
    );
    const work = await insertPersonalCalendar(anna, "Work");
    const created = await createCalendarEvent(db.db, anna, work, {
      title: "Standup",
      isAllDay: false,
      startsAt: "2026-11-20T09:00:00Z",
      endsAt: "2026-11-20T09:30:00Z",
    });
    if (created.outcome !== "found") {
      throw new Error("the owner must be able to create the event");
    }
    const before = await outboxOrder();

    await expect(
      updateCalendarEvent(db.db, anna, created.value.eventId, { calendarId: kitchen }),
    ).rejects.toThrow(EventMoveOwnerMismatchError);

    expect(await outboxOrder()).toEqual(before);
  });
});
