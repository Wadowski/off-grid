// SPDX-FileCopyrightText: 2026 Dominik Wadowski
// SPDX-License-Identifier: FSL-1.1-ALv2

import { randomUUID } from "node:crypto";
import { withFamilyContext, withUserContext, type ModuleTransaction } from "@offgrid/db";
import { withTransaction } from "@offgrid/event-bus";
import { afterAll, beforeAll, beforeEach, describe, expect, it } from "vitest";
import { startCalendarTestDatabase } from "../../../test/start-calendar-test-database.js";
import type { CalendarTestDatabase } from "../../../test/types.js";
import type { CalendarColor } from "../../domain/calendar-colors.js";
import { createDefaultCalendar } from "../../application/calendars/create-default-calendar.js";
import { deleteCalendar } from "./delete-calendar.js";
import { insertCalendar } from "./insert-calendar.js";
import { recolorCalendar } from "./recolor-calendar.js";
import { renameCalendar } from "./rename-calendar.js";

describe("calendar changes at the data level", { timeout: 60_000 }, () => {
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

  const inUserContext = <T>(userId: string, work: (tx: ModuleTransaction) => Promise<T>) =>
    db.db.$transaction(async (tx) => {
      await withUserContext(tx, userId);
      return work(tx);
    });

  const inFamilyContext = <T>(familyId: string, work: (tx: ModuleTransaction) => Promise<T>) =>
    db.db.$transaction(async (tx) => {
      await withFamilyContext(tx, familyId);
      return work(tx);
    });

  const createDefaultFor = (userId: string) =>
    withTransaction(db.pool, (client) => createDefaultCalendar(client, userId));

  const calendarRow = async (calendarId: string) => {
    const { rows } = await db.admin.query<{ name: string; color: string }>(
      "SELECT name, color FROM calendar.calendar WHERE calendar_id = $1",
      [calendarId],
    );
    return rows[0];
  };

  const insertPersonalCalendar = async (userId: string, name: string, color: CalendarColor) => {
    const calendarId = randomUUID();
    await inUserContext(userId, (tx) => insertCalendar(tx, { calendarId, userId, name, color }));
    return calendarId;
  };

  it("creates a family calendar with a name and a color", async () => {
    const familyId = randomUUID();
    const calendarId = randomUUID();

    await inFamilyContext(familyId, (tx) =>
      insertCalendar(tx, { calendarId, familyId, name: "Kitchen", color: "teal" }),
    );

    expect(await calendarRow(calendarId)).toEqual({ name: "Kitchen", color: "teal" });
  });

  it("renames a calendar and reports that a row changed", async () => {
    const userId = randomUUID();
    const calendarId = await insertPersonalCalendar(userId, "Work", "violet");

    const renamed = await inUserContext(userId, (tx) =>
      renameCalendar(tx, { calendarId, name: "  Office  " }),
    );

    expect(renamed).toBe(true);
    expect(await calendarRow(calendarId)).toEqual({ name: "Office", color: "violet" });
  });

  it("recolors a calendar and reports that a row changed", async () => {
    const userId = randomUUID();
    const calendarId = await insertPersonalCalendar(userId, "Work", "violet");

    const recolored = await inUserContext(userId, (tx) =>
      recolorCalendar(tx, { calendarId, color: "amber" }),
    );

    expect(recolored).toBe(true);
    expect(await calendarRow(calendarId)).toEqual({ name: "Work", color: "amber" });
  });

  it("deletes a non-default calendar", async () => {
    const userId = randomUUID();
    const calendarId = await insertPersonalCalendar(userId, "Work", "violet");

    const deleted = await inUserContext(userId, (tx) => deleteCalendar(tx, calendarId));

    expect(deleted).toBe(true);
    expect(await calendarRow(calendarId)).toBeUndefined();
  });

  it("keeps the default calendar when a delete is requested", async () => {
    const userId = randomUUID();
    await createDefaultFor(userId);
    const { rows } = await db.admin.query<{ calendar_id: string }>(
      "SELECT calendar_id FROM calendar.calendar WHERE user_id = $1",
      [userId],
    );

    const deleted = await inUserContext(userId, (tx) => deleteCalendar(tx, rows[0].calendar_id));

    expect(deleted).toBe(false);
    expect(await calendarRow(rows[0].calendar_id)).toEqual({ name: "Personal", color: "blue" });
  });

  it("leaves another user's calendar unchanged by rename, recolor and delete", async () => {
    const ownerId = randomUUID();
    const otherUserId = randomUUID();
    const calendarId = await insertPersonalCalendar(ownerId, "Work", "violet");

    const renamed = await inUserContext(otherUserId, (tx) =>
      renameCalendar(tx, { calendarId, name: "Hijacked" }),
    );
    const recolored = await inUserContext(otherUserId, (tx) =>
      recolorCalendar(tx, { calendarId, color: "rose" }),
    );
    const deleted = await inUserContext(otherUserId, (tx) => deleteCalendar(tx, calendarId));

    expect([renamed, recolored, deleted]).toEqual([false, false, false]);
    expect(await calendarRow(calendarId)).toEqual({ name: "Work", color: "violet" });
  });

  it("refuses an unknown color at the application layer", async () => {
    const userId = randomUUID();

    await expect(
      inUserContext(userId, (tx) =>
        insertCalendar(tx, {
          calendarId: randomUUID(),
          userId,
          name: "Work",
          color: "neon" as unknown as CalendarColor,
        }),
      ),
    ).rejects.toThrow();
  });

  it("refuses an unknown color at the database", async () => {
    await expect(
      db.admin.query(
        "INSERT INTO calendar.calendar (calendar_id, user_id, name, color) VALUES ($1, $2, 'Work', 'neon')",
        [randomUUID(), randomUUID()],
      ),
    ).rejects.toThrow(/calendar_color_check/);
  });

  it("refuses an empty name", async () => {
    const userId = randomUUID();

    await expect(
      inUserContext(userId, (tx) =>
        insertCalendar(tx, { calendarId: randomUUID(), userId, name: "   ", color: "blue" }),
      ),
    ).rejects.toThrow();
  });

  it("refuses a default calendar that has no user owner", async () => {
    await expect(
      db.admin.query(
        "INSERT INTO calendar.calendar (calendar_id, family_id, name, color, is_default) VALUES ($1, $2, 'Home', 'blue', true)",
        [randomUUID(), randomUUID()],
      ),
    ).rejects.toThrow(/calendar_default_is_personal/);
  });

  it("refuses a second default calendar for the same user", async () => {
    const userId = randomUUID();
    await createDefaultFor(userId);

    await expect(
      db.admin.query(
        "INSERT INTO calendar.calendar (calendar_id, user_id, name, color, is_default) VALUES ($1, $2, 'Second', 'blue', true)",
        [randomUUID(), userId],
      ),
    ).rejects.toThrow(/calendar_one_default_per_user/);
  });
});
