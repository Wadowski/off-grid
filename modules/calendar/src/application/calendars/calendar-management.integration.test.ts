// SPDX-FileCopyrightText: 2026 Dominik Wadowski
// SPDX-License-Identifier: FSL-1.1-ALv2

import { randomUUID } from "node:crypto";
import { withTransaction } from "@offgrid/event-bus";
import { afterAll, beforeAll, beforeEach, describe, expect, it } from "vitest";
import { startCalendarTestDatabase } from "../../../test/start-calendar-test-database.js";
import type { CalendarTestDatabase } from "../../../test/types.js";
import { applyFamilyMembership } from "../../events/family-membership/apply-family-membership.js";
import { createCalendar } from "./create-calendar.js";
import { createDefaultCalendar } from "./create-default-calendar.js";
import { listCalendarsFor } from "./list-calendars.js";
import { removeCalendar } from "./remove-calendar.js";
import { updateCalendar } from "./update-calendar.js";

describe("calendar management", { timeout: 60_000 }, () => {
  let db: CalendarTestDatabase;

  beforeAll(async () => {
    db = await startCalendarTestDatabase();
  }, 120_000);

  afterAll(async () => {
    await db.stop();
  }, 120_000);

  beforeEach(async () => {
    await db.reset();
  });

  const joinFamily = (familyId: string, userId: string) =>
    withTransaction(db.pool, (client) =>
      applyFamilyMembership(client, { familyId, userId, sourceVersion: 1, isMember: true }),
    );

  const leaveFamily = (familyId: string, userId: string) =>
    withTransaction(db.pool, (client) =>
      applyFamilyMembership(client, { familyId, userId, sourceVersion: 2, isMember: false }),
    );

  const insertFamilyCalendar = async (familyId: string, name: string, color: string) => {
    const calendarId = randomUUID();
    await db.admin.query(
      "INSERT INTO calendar.calendar (calendar_id, family_id, name, color) VALUES ($1, $2, $3, $4)",
      [calendarId, familyId, name, color],
    );
    return calendarId;
  };

  const insertPersonalCalendar = async (userId: string, name: string, color: string) => {
    const calendarId = randomUUID();
    await db.admin.query(
      "INSERT INTO calendar.calendar (calendar_id, user_id, name, color) VALUES ($1, $2, $3, $4)",
      [calendarId, userId, name, color],
    );
    return calendarId;
  };

  const insertEvent = async (calendarId: string, owner: { familyId?: string; userId?: string }) => {
    const eventId = randomUUID();
    await db.admin.query(
      `INSERT INTO calendar.calendar_event (event_id, calendar_id, family_id, user_id, title, starts_at, ends_at)
       VALUES ($1, $2, $3, $4, 'Dinner', now(), now())`,
      [eventId, calendarId, owner.familyId ?? null, owner.userId ?? null],
    );
    return eventId;
  };

  const calendarRow = async (calendarId: string) => {
    const { rows } = await db.admin.query<{ name: string; color: string }>(
      "SELECT name, color FROM calendar.calendar WHERE calendar_id = $1",
      [calendarId],
    );
    return rows[0];
  };

  const removedEventPayloads = async () => {
    const { rows } = await db.admin.query<{ payload: { eventId: string; calendarId: string } }>(
      "SELECT payload FROM outbox.event WHERE type = 'calendar-event-removed-v1'",
    );
    return rows.map((row) => row.payload);
  };

  describe("listing", () => {
    it("shows the caller's personal calendars and the family calendars of their families only", async () => {
      const anna = randomUUID();
      const ben = randomUUID();
      const home = randomUUID();
      const other = randomUUID();
      await joinFamily(home, anna);
      await insertPersonalCalendar(anna, "Work", "violet");
      await insertFamilyCalendar(home, "Kitchen", "amber");
      await insertFamilyCalendar(other, "Hidden", "rose");
      await insertPersonalCalendar(ben, "Gym", "green");

      const calendars = await listCalendarsFor(db.db, anna);

      expect(calendars.map((calendar) => calendar.name).sort()).toEqual(["Kitchen", "Work"]);
    });

    it("hides a family calendar once the caller leaves the family", async () => {
      const anna = randomUUID();
      const home = randomUUID();
      await joinFamily(home, anna);
      await insertFamilyCalendar(home, "Kitchen", "amber");
      await leaveFamily(home, anna);

      expect(await listCalendarsFor(db.db, anna)).toEqual([]);
    });
  });

  describe("creating", () => {
    it("creates a personal calendar for the caller", async () => {
      const anna = randomUUID();

      const outcome = await createCalendar(db.db, anna, { name: "Studio", color: "teal" });

      expect(outcome).toMatchObject({
        outcome: "found",
        value: { name: "Studio", color: "teal", familyId: null, isDefault: false },
      });
    });

    it("lets any family member create a family calendar", async () => {
      const ben = randomUUID();
      const home = randomUUID();
      await joinFamily(home, ben);

      const outcome = await createCalendar(db.db, ben, {
        name: "Garden",
        color: "green",
        familyId: home,
      });

      expect(outcome).toMatchObject({
        outcome: "found",
        value: { name: "Garden", familyId: home },
      });
    });

    it("answers not-found when the caller is not in the family", async () => {
      const outsider = randomUUID();
      const home = randomUUID();
      await insertFamilyCalendar(home, "Kitchen", "amber");

      const outcome = await createCalendar(db.db, outsider, {
        name: "Garden",
        color: "green",
        familyId: home,
      });

      expect(outcome).toEqual({ outcome: "not-found" });
      const { rows } = await db.admin.query(
        "SELECT 1 FROM calendar.calendar WHERE name = 'Garden'",
      );
      expect(rows).toHaveLength(0);
    });
  });

  describe("updating", () => {
    it("lets any family member rename and recolor a family calendar", async () => {
      const anna = randomUUID();
      const ben = randomUUID();
      const home = randomUUID();
      await joinFamily(home, anna);
      await joinFamily(home, ben);
      const calendarId = await insertFamilyCalendar(home, "Kitchen", "amber");

      const outcome = await updateCalendar(db.db, ben, calendarId, {
        name: "Pantry",
        color: "rose",
      });

      expect(outcome).toMatchObject({ outcome: "found", value: { name: "Pantry", color: "rose" } });
      expect(await calendarRow(calendarId)).toEqual({ name: "Pantry", color: "rose" });
    });

    it("answers not-found and leaves a personal calendar unchanged for another person", async () => {
      const anna = randomUUID();
      const ben = randomUUID();
      const calendarId = await insertPersonalCalendar(anna, "Work", "violet");

      const outcome = await updateCalendar(db.db, ben, calendarId, { name: "Hijacked" });

      expect(outcome).toEqual({ outcome: "not-found" });
      expect(await calendarRow(calendarId)).toEqual({ name: "Work", color: "violet" });
    });

    it("answers not-found and leaves a family calendar unchanged for someone outside the family", async () => {
      const outsider = randomUUID();
      const home = randomUUID();
      const calendarId = await insertFamilyCalendar(home, "Kitchen", "amber");

      const outcome = await updateCalendar(db.db, outsider, calendarId, { color: "rose" });

      expect(outcome).toEqual({ outcome: "not-found" });
      expect(await calendarRow(calendarId)).toEqual({ name: "Kitchen", color: "amber" });
    });

    it("answers not-found for a family member after they leave the family", async () => {
      const ben = randomUUID();
      const home = randomUUID();
      await joinFamily(home, ben);
      const calendarId = await insertFamilyCalendar(home, "Kitchen", "amber");
      await leaveFamily(home, ben);

      const outcome = await updateCalendar(db.db, ben, calendarId, { name: "Hijacked" });

      expect(outcome).toEqual({ outcome: "not-found" });
      expect(await calendarRow(calendarId)).toEqual({ name: "Kitchen", color: "amber" });
    });
  });

  describe("deleting", () => {
    it("removes a family calendar with its events and publishes each removed event", async () => {
      const anna = randomUUID();
      const ben = randomUUID();
      const home = randomUUID();
      await joinFamily(home, anna);
      await joinFamily(home, ben);
      const calendarId = await insertFamilyCalendar(home, "Kitchen", "amber");
      const first = await insertEvent(calendarId, { familyId: home });
      const second = await insertEvent(calendarId, { familyId: home });

      const outcome = await removeCalendar(db.db, ben, calendarId);

      expect(outcome.outcome).toBe("found");
      expect(await calendarRow(calendarId)).toBeUndefined();
      const { rows: remaining } = await db.admin.query(
        "SELECT 1 FROM calendar.calendar_event WHERE calendar_id = $1",
        [calendarId],
      );
      expect(remaining).toHaveLength(0);
      expect(await removedEventPayloads()).toEqual(
        expect.arrayContaining([
          { eventId: first, calendarId },
          { eventId: second, calendarId },
        ]),
      );
    });

    it("refuses to remove the default calendar", async () => {
      const anna = randomUUID();
      await withTransaction(db.pool, (client) => createDefaultCalendar(client, anna));
      const { rows } = await db.admin.query<{ calendar_id: string }>(
        "SELECT calendar_id FROM calendar.calendar WHERE user_id = $1",
        [anna],
      );

      const outcome = await removeCalendar(db.db, anna, rows[0].calendar_id);

      expect(outcome).toEqual({ outcome: "default-calendar" });
      expect(await calendarRow(rows[0].calendar_id)).toEqual({ name: "Personal", color: "blue" });
    });

    it("answers not-found and keeps another person's personal calendar", async () => {
      const anna = randomUUID();
      const ben = randomUUID();
      const calendarId = await insertPersonalCalendar(anna, "Work", "violet");

      const outcome = await removeCalendar(db.db, ben, calendarId);

      expect(outcome).toEqual({ outcome: "not-found" });
      expect(await calendarRow(calendarId)).toEqual({ name: "Work", color: "violet" });
    });

    it("answers not-found for a family calendar after the caller leaves the family", async () => {
      const ben = randomUUID();
      const home = randomUUID();
      await joinFamily(home, ben);
      const calendarId = await insertFamilyCalendar(home, "Kitchen", "amber");
      await leaveFamily(home, ben);

      const outcome = await removeCalendar(db.db, ben, calendarId);

      expect(outcome).toEqual({ outcome: "not-found" });
      expect(await calendarRow(calendarId)).toEqual({ name: "Kitchen", color: "amber" });
    });
  });
});
