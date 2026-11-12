// SPDX-FileCopyrightText: 2026 Dominik Wadowski
// SPDX-License-Identifier: FSL-1.1-ALv2

import { randomUUID } from "node:crypto";
import type { FastifyInstance } from "fastify";
import { afterAll, afterEach, beforeAll, beforeEach, describe, expect, it } from "vitest";
import { createCalendarTestApp } from "../../../test/create-calendar-test-app.js";
import { startCalendarTestDatabase } from "../../../test/start-calendar-test-database.js";
import type { CalendarTestDatabase } from "../../../test/types.js";

const PRIVATE_TITLE = "Private dinner with the doctor";

describe("GET /calendar/views/:view", { timeout: 60_000 }, () => {
  let db: CalendarTestDatabase;
  let app: FastifyInstance;
  const anna = randomUUID();
  const stranger = randomUUID();

  beforeAll(async () => {
    db = await startCalendarTestDatabase();
  }, 120_000);

  afterAll(async () => {
    await db.stop();
  }, 120_000);

  beforeEach(async () => {
    await db.reset();
    app = await createCalendarTestApp(db);
    await db.admin.query(
      "INSERT INTO calendar.calendar (calendar_id, user_id, name, color) VALUES ($1, $2, 'Work', 'teal')",
      [randomUUID(), anna],
    );
    await db.admin.query(
      `INSERT INTO calendar.calendar_event (event_id, calendar_id, user_id, title, starts_at, ends_at)
       SELECT $1, calendar_id, user_id, $3, $4, $5 FROM calendar.calendar WHERE user_id = $2`,
      [randomUUID(), anna, PRIVATE_TITLE, "2026-11-18T09:00:00Z", "2026-11-18T09:30:00Z"],
    );
  });

  afterEach(async () => {
    await app.close();
  });

  const get = (url: string, userId: string | null = anna) =>
    app.inject({
      method: "GET",
      url,
      ...(userId === null ? {} : { headers: { "x-user-id": userId } }),
    });

  it("answers the view with its range and one entry per day", async () => {
    const response = await get("/calendar/views/week?date=2026-11-18");

    expect(response.statusCode).toBe(200);
    const body = response.json<{
      view: string;
      startDate: string;
      endDate: string;
      days: {
        date: string;
        events: { title: string; calendarName: string; calendarColor: string }[];
      }[];
    }>();
    expect(body.view).toBe("week");
    expect(body.startDate).toBe("2026-11-16");
    expect(body.endDate).toBe("2026-11-22");
    expect(body.days).toHaveLength(7);
    const eventDay = body.days.find((day) => day.date === "2026-11-18");
    expect(eventDay?.events).toEqual([
      expect.objectContaining({
        title: PRIVATE_TITLE,
        calendarName: "Work",
        calendarColor: "teal",
      }),
    ]);
  });

  it("answers an empty range without events for a person with no calendar events", async () => {
    const response = await get("/calendar/views/day?date=2026-11-18", stranger);

    expect(response.statusCode).toBe(200);
    expect(response.json<{ days: { events: unknown[] }[] }>().days[0]?.events).toEqual([]);
  });

  it("refuses an unknown view with a validation error that does not echo the title", async () => {
    const response = await get("/calendar/views/year?date=2026-11-18");

    expect(response.statusCode).toBe(400);
    expect(response.json<{ code: string }>().code).toBe("VALIDATION_FAILED");
    expect(response.body).not.toContain(PRIVATE_TITLE);
  });

  it("refuses a missing or malformed date", async () => {
    expect((await get("/calendar/views/week")).statusCode).toBe(400);
    expect((await get("/calendar/views/week?date=2026-02-30")).statusCode).toBe(400);
    expect((await get("/calendar/views/week?date=18-11-2026")).statusCode).toBe(400);
  });

  it("does not return another person's events", async () => {
    const response = await get("/calendar/views/day?date=2026-11-18", stranger);

    expect(response.body).not.toContain(PRIVATE_TITLE);
  });

  it("refuses a request without a signed-in user", async () => {
    const response = await get("/calendar/views/day?date=2026-11-18", null);

    expect(response.statusCode).toBe(401);
  });
});
