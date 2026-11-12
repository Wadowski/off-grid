// SPDX-FileCopyrightText: 2026 Dominik Wadowski
// SPDX-License-Identifier: FSL-1.1-ALv2

import { randomUUID } from "node:crypto";

import type { FastifyInstance } from "fastify";
import { afterAll, afterEach, beforeAll, beforeEach, describe, expect, it } from "vitest";
import { createCalendarTestApp } from "../../../test/create-calendar-test-app.js";
import { startCalendarTestDatabase } from "../../../test/start-calendar-test-database.js";
import type { CalendarTestDatabase } from "../../../test/types.js";
import { applyFamilyMembership } from "../../events/family-membership/apply-family-membership.js";

const PRIVATE_TITLE = "Private dinner with the doctor";

describe("calendar event routes", { timeout: 60_000 }, () => {
  let db: CalendarTestDatabase;
  let app: FastifyInstance;
  const anna = randomUUID();
  const ben = randomUUID();
  const carol = randomUUID();
  const home = randomUUID();

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
  });

  afterEach(async () => {
    await app.close();
  });

  const insertCalendar = async (
    owner: { userId?: string; familyId?: string },
    name: string,
  ): Promise<string> => {
    const calendarId = randomUUID();
    await db.admin.query(
      "INSERT INTO calendar.calendar (calendar_id, family_id, user_id, name, color) VALUES ($1, $2, $3, $4, 'blue')",
      [calendarId, owner.familyId ?? null, owner.userId ?? null, name],
    );
    return calendarId;
  };

  const request = (method: string, url: string, userId: string, payload?: unknown) =>
    app.inject({
      method: method as "GET",
      url,
      headers: { "x-user-id": userId },
      ...(payload === undefined ? {} : { payload: payload as Record<string, unknown> }),
    });

  const timedBody = {
    title: PRIVATE_TITLE,
    isAllDay: false,
    startsAt: "2026-11-20T09:00:00Z",
    endsAt: "2026-11-20T09:30:00Z",
  };

  const createEvent = async (userId: string, calendarId: string, body = timedBody) => {
    const response = await request("POST", `/calendars/${calendarId}/events`, userId, body);
    expect(response.statusCode).toBe(201);
    return response.json<{ id: string }>().id;
  };

  describe("POST /calendars/:id/events", () => {
    it("creates a timed event and returns 201", async () => {
      const work = await insertCalendar({ userId: anna }, "Work");

      const response = await request("POST", `/calendars/${work}/events`, anna, timedBody);

      expect(response.statusCode).toBe(201);
      expect(response.json()).toMatchObject({
        calendarId: work,
        title: PRIVATE_TITLE,
        isAllDay: false,
        startsAt: "2026-11-20T09:00:00.000Z",
        endsAt: "2026-11-20T09:30:00.000Z",
      });
    });

    it("refuses an end before the start with 400 and does not echo the title", async () => {
      const work = await insertCalendar({ userId: anna }, "Work");

      const response = await request("POST", `/calendars/${work}/events`, anna, {
        ...timedBody,
        endsAt: "2026-11-20T08:00:00Z",
      });

      expect(response.statusCode).toBe(400);
      expect(response.json().code).toBe("VALIDATION_FAILED");
      expect(response.body).not.toContain(PRIVATE_TITLE);
    });

    it("answers 404 for a family calendar the caller is not a member of", async () => {
      const kitchen = await insertCalendar({ familyId: home }, "Kitchen");

      const response = await request("POST", `/calendars/${kitchen}/events`, carol, timedBody);

      expect(response.statusCode).toBe(404);
    });
  });

  describe("GET /calendars/:id/events and GET /events/:id", () => {
    it("lists the events of a calendar a family member can see", async () => {
      const kitchen = await insertCalendar({ familyId: home }, "Kitchen");
      await createEvent(ben, kitchen);

      const response = await request("GET", `/calendars/${kitchen}/events`, anna);

      expect(response.statusCode).toBe(200);
      expect(response.json().events).toHaveLength(1);
    });

    it("answers 404 when the caller cannot see the calendar or the event", async () => {
      const gym = await insertCalendar({ userId: carol }, "Gym");
      const eventId = await createEvent(carol, gym);

      expect((await request("GET", `/calendars/${gym}/events`, anna)).statusCode).toBe(404);
      expect((await request("GET", `/events/${eventId}`, anna)).statusCode).toBe(404);
      expect((await request("GET", `/events/${eventId}`, carol)).statusCode).toBe(200);
    });
  });

  describe("PATCH /events/:id", () => {
    it("updates the title and returns 200", async () => {
      const work = await insertCalendar({ userId: anna }, "Work");
      const eventId = await createEvent(anna, work);

      const response = await request("PATCH", `/events/${eventId}`, anna, { title: "Moved on" });

      expect(response.statusCode).toBe(200);
      expect(response.json().title).toBe("Moved on");
    });

    it("refuses a merged window that ends before it starts with 400 and does not echo the title", async () => {
      const work = await insertCalendar({ userId: anna }, "Work");
      const eventId = await createEvent(anna, work);

      const response = await request("PATCH", `/events/${eventId}`, anna, {
        endsAt: "2026-11-20T08:00:00Z",
      });

      expect(response.statusCode).toBe(400);
      expect(response.body).not.toContain(PRIVATE_TITLE);
    });

    it("refuses a cross-owner move with 409 and does not echo the title", async () => {
      const home2 = await insertCalendar({ familyId: home }, "Kitchen");
      const work = await insertCalendar({ userId: anna }, "Work");
      const eventId = await createEvent(anna, work);

      const response = await request("PATCH", `/events/${eventId}`, anna, {
        calendarId: home2,
      });

      expect(response.statusCode).toBe(409);
      expect(response.json().code).toBe("EVENT_MOVE_OWNER_MISMATCH");
      expect(response.body).not.toContain(PRIVATE_TITLE);
    });

    it("answers 404 for an event the caller cannot see", async () => {
      const gym = await insertCalendar({ userId: carol }, "Gym");
      const eventId = await createEvent(carol, gym);

      const response = await request("PATCH", `/events/${eventId}`, anna, { title: "x" });

      expect(response.statusCode).toBe(404);
    });

    it("answers 400 for a body with both timed and all-day fields", async () => {
      const work = await insertCalendar({ userId: anna }, "Work");
      const eventId = await createEvent(anna, work);

      const response = await request("PATCH", `/events/${eventId}`, anna, {
        startsAt: "2026-11-20T08:00:00Z",
        startDate: "2026-11-20",
      });

      expect(response.statusCode).toBe(400);
    });
  });

  describe("DELETE /events/:id", () => {
    it("removes the event with 204 and then answers 404", async () => {
      const work = await insertCalendar({ userId: anna }, "Work");
      const eventId = await createEvent(anna, work);

      expect((await request("DELETE", `/events/${eventId}`, anna)).statusCode).toBe(204);
      expect((await request("GET", `/events/${eventId}`, anna)).statusCode).toBe(404);
    });
  });

  describe("time zone", () => {
    it("reports UTC as unset until the caller sets a zone", async () => {
      const first = await request("GET", "/calendar/time-zone", anna);
      expect(first.json()).toEqual({ timeZone: "UTC", isSet: false });

      const set = await request("PUT", "/calendar/time-zone", anna, { timeZone: "Europe/Warsaw" });
      expect(set.statusCode).toBe(200);
      expect(set.json()).toEqual({ timeZone: "Europe/Warsaw", isSet: true });
    });

    it("refuses an unknown zone with 400", async () => {
      const response = await request("PUT", "/calendar/time-zone", anna, {
        timeZone: "Mars/Olympus",
      });

      expect(response.statusCode).toBe(400);
    });
  });
});
