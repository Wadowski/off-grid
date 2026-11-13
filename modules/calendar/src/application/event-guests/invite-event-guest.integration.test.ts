// SPDX-FileCopyrightText: 2026 Dominik Wadowski
// SPDX-License-Identifier: FSL-1.1-ALv2

import { randomUUID } from "node:crypto";
import { afterAll, beforeAll, beforeEach, describe, expect, it } from "vitest";
import { startCalendarTestDatabase } from "../../../test/start-calendar-test-database.js";
import type { CalendarTestDatabase } from "../../../test/types.js";
import { EventGuestInviteRefusedError } from "../errors/event-guest-invite-refused-error.js";
import { EventGuestWriteDeniedError } from "../errors/event-guest-write-denied-error.js";
import { inviteEventGuest } from "./invite-event-guest.js";

describe("inviteEventGuest", { timeout: 60_000 }, () => {
  let db: CalendarTestDatabase;
  const host = randomUUID();
  const guest = randomUUID();
  const stranger = randomUUID();
  const familyId = randomUUID();
  const calendarId = randomUUID();
  const familyCalendarId = randomUUID();
  const eventId = randomUUID();
  const familyEventId = randomUUID();

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
      "INSERT INTO calendar.family_membership (family_id, user_id, source_version, is_member) VALUES ($1, $2, 1, true), ($1, $3, 1, true)",
      [familyId, host, guest],
    );
    await db.admin.query(
      "INSERT INTO calendar.calendar (calendar_id, user_id, name, color) VALUES ($1, $2, 'Work', 'blue')",
      [calendarId, host],
    );
    await db.admin.query(
      "INSERT INTO calendar.calendar (calendar_id, family_id, name, color) VALUES ($1, $2, 'Kitchen', 'teal')",
      [familyCalendarId, familyId],
    );
    await db.admin.query(
      "INSERT INTO calendar.calendar_event (event_id, calendar_id, user_id, title, starts_at, ends_at) VALUES ($1, $2, $3, 'Review', '2026-11-20T10:00:00Z', '2026-11-20T11:00:00Z')",
      [eventId, calendarId, host],
    );
    await db.admin.query(
      "INSERT INTO calendar.calendar_event (event_id, calendar_id, family_id, title, starts_at, ends_at) VALUES ($1, $2, $3, 'Dinner', '2026-11-20T18:00:00Z', '2026-11-20T19:00:00Z')",
      [familyEventId, familyCalendarId, familyId],
    );
  });

  const guestRows = async (): Promise<number> => {
    const { rows } = await db.admin.query("SELECT 1 FROM calendar.event_guest");
    return rows.length;
  };

  const outboxRows = async (): Promise<number> => {
    const { rows } = await db.admin.query("SELECT 1 FROM outbox.event");
    return rows.length;
  };

  it("writes the guest row and the fact once for a family member", async () => {
    const outcome = await inviteEventGuest(db.db, host, eventId, guest);

    expect(outcome).toEqual({ outcome: "invited" });
    expect(await guestRows()).toBe(1);
    expect(await outboxRows()).toBe(1);
  });

  it("answers already-invited and publishes nothing when the guest is invited again", async () => {
    await inviteEventGuest(db.db, host, eventId, guest);
    const outcome = await inviteEventGuest(db.db, host, eventId, guest);

    expect(outcome).toEqual({ outcome: "already-invited" });
    expect(await guestRows()).toBe(1);
    expect(await outboxRows()).toBe(1);
  });

  it("answers not-found for an event the host cannot see", async () => {
    const outcome = await inviteEventGuest(db.db, stranger, eventId, guest);

    expect(outcome).toEqual({ outcome: "not-found" });
    expect(await guestRows()).toBe(0);
  });

  it("refuses to invite the host to their own event", async () => {
    await expect(inviteEventGuest(db.db, host, eventId, host)).rejects.toThrow(
      EventGuestInviteRefusedError,
    );
    expect(await guestRows()).toBe(0);
  });

  it("refuses a user who shares no family with the host", async () => {
    await expect(inviteEventGuest(db.db, host, eventId, stranger)).rejects.toThrow(
      EventGuestInviteRefusedError,
    );
    expect(await guestRows()).toBe(0);
    expect(await outboxRows()).toBe(0);
  });

  it("refuses an invite to a family-owned event", async () => {
    await expect(inviteEventGuest(db.db, host, familyEventId, guest)).rejects.toThrow(
      EventGuestInviteRefusedError,
    );
    expect(await guestRows()).toBe(0);
  });

  it("denies an invite sent by a guest of the event", async () => {
    await inviteEventGuest(db.db, host, eventId, guest);
    const other = randomUUID();
    await db.admin.query(
      "INSERT INTO calendar.family_membership (family_id, user_id, source_version, is_member) VALUES ($1, $2, 1, true)",
      [familyId, other],
    );

    await expect(inviteEventGuest(db.db, guest, eventId, other)).rejects.toThrow(
      EventGuestWriteDeniedError,
    );
    expect(await guestRows()).toBe(1);
  });
});
