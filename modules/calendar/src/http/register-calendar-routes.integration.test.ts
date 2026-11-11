// SPDX-FileCopyrightText: 2026 Dominik Wadowski
// SPDX-License-Identifier: FSL-1.1-ALv2

import { randomUUID } from "node:crypto";
import { withTransaction } from "@offgrid/event-bus";
import type { FastifyInstance } from "fastify";
import { afterAll, afterEach, beforeAll, beforeEach, describe, expect, it } from "vitest";
import { applyFamilyMembership } from "../events/family-membership/apply-family-membership.js";
import { createDefaultCalendar } from "../application/calendars/create-default-calendar.js";
import { createCalendarTestApp } from "../../test/create-calendar-test-app.js";
import { startCalendarTestDatabase } from "../../test/start-calendar-test-database.js";
import type { CalendarTestDatabase } from "../../test/types.js";

describe("calendar routes", { timeout: 60_000 }, () => {
  let db: CalendarTestDatabase;
  let app: FastifyInstance;
  const anna = randomUUID();
  const ben = randomUUID();
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
    await withTransaction(db.pool, (client) => createDefaultCalendar(client, anna));
    await withTransaction(db.pool, (client) =>
      applyFamilyMembership(client, {
        familyId: home,
        userId: anna,
        sourceVersion: 1,
        isMember: true,
      }),
    );
  });

  afterEach(async () => {
    await app.close();
  });

  const defaultCalendarId = async (userId: string) => {
    const { rows } = await db.admin.query<{ calendar_id: string }>(
      "SELECT calendar_id FROM calendar.calendar WHERE user_id = $1 AND is_default",
      [userId],
    );
    return rows[0]?.calendar_id ?? "";
  };

  const insertPersonalCalendar = async (userId: string, name: string) => {
    const calendarId = randomUUID();
    await db.admin.query(
      "INSERT INTO calendar.calendar (calendar_id, user_id, name, color) VALUES ($1, $2, $3, 'blue')",
      [calendarId, userId, name],
    );
    return calendarId;
  };

  describe("GET /calendars", () => {
    it("lists the calendars the caller can use", async () => {
      await insertPersonalCalendar(anna, "Work");

      const response = await app.inject({
        method: "GET",
        url: "/calendars",
        headers: { "x-user-id": anna },
      });

      expect(response.statusCode).toBe(200);
      const names = response.json().calendars.map((calendar: { name: string }) => calendar.name);
      expect(names).toEqual(expect.arrayContaining(["Work"]));
    });

    it("answers 401 when no user is signed in", async () => {
      const response = await app.inject({ method: "GET", url: "/calendars" });

      expect(response.statusCode).toBe(401);
    });
  });

  describe("POST /calendars", () => {
    it("creates a personal calendar and answers 201", async () => {
      const response = await app.inject({
        method: "POST",
        url: "/calendars",
        headers: { "x-user-id": anna },
        payload: { name: "Studio", color: "teal" },
      });

      expect(response.statusCode).toBe(201);
      expect(response.json()).toMatchObject({ name: "Studio", color: "teal", familyId: null });
    });

    it("creates a family calendar for a member", async () => {
      const response = await app.inject({
        method: "POST",
        url: "/calendars",
        headers: { "x-user-id": anna },
        payload: { name: "Garden", color: "green", familyId: home },
      });

      expect(response.statusCode).toBe(201);
      expect(response.json()).toMatchObject({ familyId: home });
    });

    it("answers 404 for a family the caller does not belong to", async () => {
      const response = await app.inject({
        method: "POST",
        url: "/calendars",
        headers: { "x-user-id": ben },
        payload: { name: "Garden", color: "green", familyId: home },
      });

      expect(response.statusCode).toBe(404);
    });

    it("answers 400 for an unknown color", async () => {
      const response = await app.inject({
        method: "POST",
        url: "/calendars",
        headers: { "x-user-id": anna },
        payload: { name: "Studio", color: "neon" },
      });

      expect(response.statusCode).toBe(400);
    });
  });

  describe("PATCH /calendars/:id", () => {
    it("renames and recolors a calendar the caller owns", async () => {
      const calendarId = await insertPersonalCalendar(anna, "Work");

      const response = await app.inject({
        method: "PATCH",
        url: `/calendars/${calendarId}`,
        headers: { "x-user-id": anna },
        payload: { name: "Office", color: "rose" },
      });

      expect(response.statusCode).toBe(200);
      expect(response.json()).toMatchObject({ name: "Office", color: "rose" });
    });

    it("answers 404 for a calendar another person owns", async () => {
      const calendarId = await insertPersonalCalendar(anna, "Work");

      const response = await app.inject({
        method: "PATCH",
        url: `/calendars/${calendarId}`,
        headers: { "x-user-id": ben },
        payload: { name: "Hijacked" },
      });

      expect(response.statusCode).toBe(404);
    });

    it("answers 400 when nothing is sent to change", async () => {
      const calendarId = await insertPersonalCalendar(anna, "Work");

      const response = await app.inject({
        method: "PATCH",
        url: `/calendars/${calendarId}`,
        headers: { "x-user-id": anna },
        payload: {},
      });

      expect(response.statusCode).toBe(400);
    });
  });

  describe("DELETE /calendars/:id", () => {
    it("deletes a personal calendar and answers 204", async () => {
      const calendarId = await insertPersonalCalendar(anna, "Work");

      const response = await app.inject({
        method: "DELETE",
        url: `/calendars/${calendarId}`,
        headers: { "x-user-id": anna },
      });

      expect(response.statusCode).toBe(204);
    });

    it("answers 409 for the default calendar", async () => {
      const response = await app.inject({
        method: "DELETE",
        url: `/calendars/${await defaultCalendarId(anna)}`,
        headers: { "x-user-id": anna },
      });

      expect(response.statusCode).toBe(409);
      expect(response.json()).toMatchObject({ code: "DEFAULT_CALENDAR" });
    });

    it("answers 404 for a calendar another person owns", async () => {
      const calendarId = await insertPersonalCalendar(anna, "Work");

      const response = await app.inject({
        method: "DELETE",
        url: `/calendars/${calendarId}`,
        headers: { "x-user-id": ben },
      });

      expect(response.statusCode).toBe(404);
    });
  });
});
