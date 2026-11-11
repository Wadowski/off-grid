// SPDX-FileCopyrightText: 2026 Dominik Wadowski
// SPDX-License-Identifier: FSL-1.1-ALv2

import { randomUUID } from "node:crypto";
import type { PoolClient } from "pg";
import { afterAll, beforeAll, beforeEach, describe, expect, it } from "vitest";
import { startCalendarTestDatabase } from "../../../test/start-calendar-test-database.js";
import type { CalendarTestDatabase } from "../../../test/types.js";
import { createDefaultCalendar } from "../../application/calendars/create-default-calendar.js";
import { deleteCalendar } from "./delete-calendar.js";
import { insertCalendar } from "./insert-calendar.js";
import { recolorCalendar } from "./recolor-calendar.js";
import { renameCalendar } from "./rename-calendar.js";
import { setUserContext } from "./set-user-context.js";

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

  const inContext = async <T>(
    setContext: (client: PoolClient) => Promise<void>,
    work: (client: PoolClient) => Promise<T>,
  ): Promise<T> => {
    const client = await db.pool.connect();
    try {
      await client.query("BEGIN");
      await setContext(client);
      const result = await work(client);
      await client.query("COMMIT");
      return result;
    } catch (error) {
      await client.query("ROLLBACK");
      throw error;
    } finally {
      client.release();
    }
  };

  const inUserContext = <T>(userId: string, work: (client: PoolClient) => Promise<T>) =>
    inContext((client) => setUserContext(client, userId), work);

  const inFamilyContext = <T>(familyId: string, work: (client: PoolClient) => Promise<T>) =>
    inContext(
      (client) =>
        client
          .query("SELECT set_config('app.family_id', $1, true)", [familyId])
          .then(() => undefined),
      work,
    );

  const calendarRow = async (calendarId: string) => {
    const { rows } = await db.admin.query<{ name: string; color: string }>(
      "SELECT name, color FROM calendar.calendar WHERE calendar_id = $1",
      [calendarId],
    );
    return rows[0];
  };

  it("creates a family calendar with a name and a color", async () => {
    const familyId = randomUUID();
    const calendarId = randomUUID();

    await inFamilyContext(familyId, (client) =>
      insertCalendar(client, { calendarId, familyId, name: "Kitchen", color: "teal" }),
    );

    expect(await calendarRow(calendarId)).toEqual({ name: "Kitchen", color: "teal" });
  });

  it("renames a calendar", async () => {
    const userId = randomUUID();
    const calendarId = randomUUID();
    await inUserContext(userId, (client) =>
      insertCalendar(client, { calendarId, userId, name: "Work", color: "violet" }),
    );

    await inUserContext(userId, (client) =>
      renameCalendar(client, { calendarId, name: "  Office  " }),
    );

    expect(await calendarRow(calendarId)).toEqual({ name: "Office", color: "violet" });
  });

  it("recolors a calendar", async () => {
    const userId = randomUUID();
    const calendarId = randomUUID();
    await inUserContext(userId, (client) =>
      insertCalendar(client, { calendarId, userId, name: "Work", color: "violet" }),
    );

    await inUserContext(userId, (client) =>
      recolorCalendar(client, { calendarId, color: "amber" }),
    );

    expect(await calendarRow(calendarId)).toEqual({ name: "Work", color: "amber" });
  });

  it("deletes a non-default calendar", async () => {
    const userId = randomUUID();
    const calendarId = randomUUID();
    await inUserContext(userId, (client) =>
      insertCalendar(client, { calendarId, userId, name: "Work", color: "violet" }),
    );

    const deleted = await inUserContext(userId, (client) => deleteCalendar(client, calendarId));

    expect(deleted).toBe(true);
    expect(await calendarRow(calendarId)).toBeUndefined();
  });

  it("keeps the default calendar when a delete is requested", async () => {
    const userId = randomUUID();
    await inUserContext(userId, (client) => createDefaultCalendar(client, userId));
    const { rows } = await db.admin.query<{ calendar_id: string }>(
      "SELECT calendar_id FROM calendar.calendar WHERE user_id = $1",
      [userId],
    );

    const deleted = await inUserContext(userId, (client) =>
      deleteCalendar(client, rows[0].calendar_id),
    );

    expect(deleted).toBe(false);
    expect(await calendarRow(rows[0].calendar_id)).toEqual({ name: "Personal", color: "blue" });
  });

  it("refuses an unknown color", async () => {
    const userId = randomUUID();

    await expect(
      inUserContext(userId, (client) =>
        insertCalendar(client, {
          calendarId: randomUUID(),
          userId,
          name: "Work",
          color: "neon" as "blue",
        }),
      ),
    ).rejects.toThrow();
  });

  it("refuses an empty name", async () => {
    const userId = randomUUID();

    await expect(
      inUserContext(userId, (client) =>
        insertCalendar(client, { calendarId: randomUUID(), userId, name: "   ", color: "blue" }),
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
    await inUserContext(userId, (client) => createDefaultCalendar(client, userId));

    await expect(
      db.admin.query(
        "INSERT INTO calendar.calendar (calendar_id, user_id, name, color, is_default) VALUES ($1, $2, 'Second', 'blue', true)",
        [randomUUID(), userId],
      ),
    ).rejects.toThrow(/calendar_one_default_per_user/);
  });
});
