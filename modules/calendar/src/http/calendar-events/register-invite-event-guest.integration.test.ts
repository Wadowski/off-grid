// SPDX-FileCopyrightText: 2026 Dominik Wadowski
// SPDX-License-Identifier: FSL-1.1-ALv2

import { randomUUID } from "node:crypto";
import type { FastifyInstance } from "fastify";
import { afterAll, afterEach, beforeAll, beforeEach, describe, expect, it } from "vitest";
import { createCalendarTestApp } from "../../../test/create-calendar-test-app.js";
import { startCalendarTestDatabase } from "../../../test/start-calendar-test-database.js";
import type { CalendarTestDatabase } from "../../../test/types.js";
import { applyFamilyMembership } from "../../events/family-membership/apply-family-membership.js";

describe("POST /events/:id/guests", { timeout: 60_000 }, () => {
  let db: CalendarTestDatabase;
  let app: FastifyInstance;
  const anna = randomUUID();
  const ben = randomUUID();
  const carol = randomUUID();
  const stranger = randomUUID();
  const home = randomUUID();
  const eventId = randomUUID();
  const familyEventId = randomUUID();
  const calendarId = randomUUID();
  const familyCalendarId = randomUUID();

  beforeAll(async () => {
    db = await startCalendarTestDatabase();
  }, 120_000);

  afterAll(async () => {
    await db.stop();
  }, 120_000);

  beforeEach(async () => {
    await db.reset();
    app = await createCalendarTestApp(db);
    for (const member of [anna, ben]) {
      await db.db.$transaction((tx) =>
        applyFamilyMembership(tx, {
          familyId: home,
          userId: member,
          sourceVersion: 1,
          isMember: true,
        }),
      );
    }
    await db.admin.query(
      "INSERT INTO calendar.calendar (calendar_id, user_id, name, color) VALUES ($1, $2, 'Work', 'blue')",
      [calendarId, anna],
    );
    await db.admin.query(
      "INSERT INTO calendar.calendar (calendar_id, family_id, name, color) VALUES ($1, $2, 'Kitchen', 'teal')",
      [familyCalendarId, home],
    );
    await db.admin.query(
      "INSERT INTO calendar.calendar_event (event_id, calendar_id, user_id, title, starts_at, ends_at) VALUES ($1, $2, $3, 'Review', '2026-11-20T10:00:00Z', '2026-11-20T11:00:00Z')",
      [eventId, calendarId, anna],
    );
    await db.admin.query(
      "INSERT INTO calendar.calendar_event (event_id, calendar_id, family_id, title, starts_at, ends_at) VALUES ($1, $2, $3, 'Dinner', '2026-11-20T18:00:00Z', '2026-11-20T19:00:00Z')",
      [familyEventId, familyCalendarId, home],
    );
  });

  afterEach(async () => {
    await app.close();
  });

  const invite = (userId: string, id: string, payload: unknown) =>
    app.inject({
      method: "POST",
      url: `/events/${id}/guests`,
      headers: { "x-user-id": userId },
      payload: payload as Record<string, unknown>,
    });

  it("answers 201 for a new guest and 200 when the guest is invited again", async () => {
    const first = await invite(anna, eventId, { guestUserId: ben });
    const again = await invite(anna, eventId, { guestUserId: ben });

    expect(first.statusCode).toBe(201);
    expect(first.json()).toEqual({ eventId, guestUserId: ben });
    expect(again.statusCode).toBe(200);
    expect(again.json()).toEqual({ eventId, guestUserId: ben });
  });

  it("answers 400 VALIDATION_FAILED for a body with unknown fields", async () => {
    const response = await invite(anna, eventId, { guestUserId: ben, email: "ben@example.test" });

    expect(response.statusCode).toBe(400);
    expect(response.json()).toMatchObject({ code: "VALIDATION_FAILED" });
  });

  it("answers the same 400 for a family-owned event and for a user who shares no family", async () => {
    const familyEvent = await invite(anna, familyEventId, { guestUserId: ben });
    const outsider = await invite(anna, eventId, { guestUserId: stranger });

    expect(familyEvent.statusCode).toBe(400);
    expect(outsider.statusCode).toBe(400);
    expect(familyEvent.json()).toEqual(outsider.json());
    expect(familyEvent.json()).toMatchObject({ code: "VALIDATION_FAILED" });
  });

  it("answers 404 for an event the caller cannot see", async () => {
    const response = await invite(stranger, eventId, { guestUserId: ben });

    expect(response.statusCode).toBe(404);
  });

  it("answers 403 FORBIDDEN when a guest of the event invites someone", async () => {
    await invite(anna, eventId, { guestUserId: ben });
    await db.db.$transaction((tx) =>
      applyFamilyMembership(tx, {
        familyId: home,
        userId: carol,
        sourceVersion: 1,
        isMember: true,
      }),
    );

    const response = await invite(ben, eventId, { guestUserId: carol });

    expect(response.statusCode).toBe(403);
    expect(response.json()).toMatchObject({ code: "FORBIDDEN" });
  });
});
