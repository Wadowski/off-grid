// SPDX-FileCopyrightText: 2026 Dominik Wadowski
// SPDX-License-Identifier: FSL-1.1-ALv2

import { randomUUID } from "node:crypto";
import { calendarEventCreatedV1 } from "@offgrid/contracts";
import { createEventBus } from "@offgrid/event-bus";
import { createMemoryErrorSink } from "@offgrid/observability";
import { afterAll, beforeAll, beforeEach, describe, expect, it } from "vitest";
import { startCalendarTestDatabase } from "../../../test/start-calendar-test-database.js";
import type { CalendarTestDatabase } from "../../../test/types.js";
import { createCalendarEvent } from "../../application/calendar-events/create-calendar-event.js";

const SEVEN_DAYS_IN_SECONDS = 7 * 24 * 60 * 60;

describe("calendar event retention", { timeout: 60_000 }, () => {
  let db: CalendarTestDatabase;

  beforeAll(async () => {
    db = await startCalendarTestDatabase();
  }, 120_000);

  afterAll(async () => {
    await db.stop();
  }, 120_000);

  beforeEach(async () => {
    await db.reset();
    await db.admin.query("TRUNCATE outbox.event, outbox.subscriber_cursor");
  });

  it("prunes a delivered calendar event older than the retention and keeps a recent one", async () => {
    const anna = randomUUID();
    const calendarId = randomUUID();
    await db.admin.query(
      "INSERT INTO calendar.calendar (calendar_id, user_id, name, color) VALUES ($1, $2, 'Work', 'blue')",
      [calendarId, anna],
    );
    const createEvent = async (title: string): Promise<string> => {
      const outcome = await createCalendarEvent(db.db, anna, calendarId, {
        title,
        isAllDay: false,
        startsAt: "2026-11-20T09:00:00Z",
        endsAt: "2026-11-20T09:30:00Z",
      });
      if (outcome.outcome !== "found") {
        throw new Error("the owner must be able to create the event");
      }
      return outcome.value.eventId;
    };
    const oldEventId = await createEvent("Old standup");
    const recentEventId = await createEvent("Recent standup");
    await db.admin.query(
      "UPDATE outbox.event SET published_at = now() - interval '8 days' WHERE payload->>'eventId' = $1",
      [oldEventId],
    );
    const bus = createEventBus({ pool: db.pool, errorSink: createMemoryErrorSink() });
    bus.subscribe({
      name: "calendar-retention-test",
      event: calendarEventCreatedV1,
      runAs: "calendar",
      handler: async () => undefined,
    });
    await bus.deliverPending();

    expect(await bus.prune(SEVEN_DAYS_IN_SECONDS)).toBe(1);

    const { rows } = await db.admin.query<{ event_id: string }>(
      "SELECT payload->>'eventId' AS event_id FROM outbox.event",
    );
    expect(rows.map((row) => row.event_id)).toEqual([recentEventId]);
  });
});
