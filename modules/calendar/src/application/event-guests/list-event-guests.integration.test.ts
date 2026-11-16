// SPDX-FileCopyrightText: 2026 Dominik Wadowski
// SPDX-License-Identifier: FSL-1.1-ALv2

import { randomUUID } from "node:crypto";
import { afterAll, beforeAll, beforeEach, describe, expect, it } from "vitest";
import { startCalendarTestDatabase } from "../../../test/start-calendar-test-database.js";
import type { CalendarTestDatabase } from "../../../test/types.js";
import { inviteEventGuest } from "./invite-event-guest.js";
import { listEventGuests } from "./list-event-guests.js";

describe("listEventGuests", { timeout: 60_000 }, () => {
  let db: CalendarTestDatabase;
  const host = randomUUID();
  const guest = randomUUID();
  const otherGuest = randomUUID();
  const stranger = randomUUID();
  const familyId = randomUUID();
  const calendarId = randomUUID();
  const eventId = randomUUID();

  beforeAll(async () => {
    db = await startCalendarTestDatabase();
  }, 120_000);

  afterAll(async () => {
    await db.stop();
  }, 120_000);

  beforeEach(async () => {
    await db.reset();
    await db.admin.query("TRUNCATE outbox.event");
    await db.admin.query(
      "INSERT INTO calendar.family_membership (family_id, user_id, source_version, is_member) VALUES ($1, $2, 1, true), ($1, $3, 1, true), ($1, $4, 1, true)",
      [familyId, host, guest, otherGuest],
    );
    await db.admin.query(
      "INSERT INTO calendar.calendar (calendar_id, user_id, name, color) VALUES ($1, $2, 'Work', 'blue')",
      [calendarId, host],
    );
    await db.admin.query(
      "INSERT INTO calendar.calendar_event (event_id, calendar_id, user_id, title, starts_at, ends_at) VALUES ($1, $2, $3, 'Review', '2026-11-20T10:00:00Z', '2026-11-20T11:00:00Z')",
      [eventId, calendarId, host],
    );
  });

  it("lists the invited guests for the host", async () => {
    await inviteEventGuest(db.db, host, eventId, guest);
    await inviteEventGuest(db.db, host, eventId, otherGuest);

    const listing = await listEventGuests(db.db, host, eventId);

    expect(listing.outcome).toBe("found");
    if (listing.outcome !== "found") {
      return;
    }
    expect(listing.guests.map((row) => row.userId).sort()).toEqual([guest, otherGuest].sort());
    expect(listing.guests[0]?.invitedAt).toMatch(/^\d{4}-\d{2}-\d{2}T/);
  });

  it("lists the other guests for a guest of the event", async () => {
    await inviteEventGuest(db.db, host, eventId, guest);
    await inviteEventGuest(db.db, host, eventId, otherGuest);

    const listing = await listEventGuests(db.db, guest, eventId);

    expect(listing.outcome).toBe("found");
    if (listing.outcome !== "found") {
      return;
    }
    expect(listing.guests.map((row) => row.userId).sort()).toEqual([guest, otherGuest].sort());
  });

  it("answers not-found for a user who cannot see the event", async () => {
    await inviteEventGuest(db.db, host, eventId, guest);

    expect(await listEventGuests(db.db, stranger, eventId)).toEqual({ outcome: "not-found" });
  });

  it("answers an empty list for an event with no guests", async () => {
    expect(await listEventGuests(db.db, host, eventId)).toEqual({ outcome: "found", guests: [] });
  });
});
