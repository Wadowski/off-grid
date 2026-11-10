// SPDX-FileCopyrightText: 2026 Dominik Wadowski
// SPDX-License-Identifier: FSL-1.1-ALv2

import { randomUUID } from "node:crypto";
import type { Pool } from "pg";
import { afterAll, beforeAll, beforeEach, describe, expect, it } from "vitest";
import {
  startCalendarTestDatabase,
  type CalendarTestDatabase,
} from "../../test/start-calendar-test-database.js";

const selectCalendarsAs = async (
  pool: Pool,
  setting: "app.family_id" | "app.user_id",
  value: string | null,
) => {
  const client = await pool.connect();
  try {
    await client.query("BEGIN");
    await client.query("SELECT set_config($1, $2, true)", [setting, value ?? ""]);
    const result = await client.query<{ calendar_id: string }>(
      "SELECT calendar_id FROM calendar.calendar",
    );
    await client.query("COMMIT");
    return result.rows;
  } catch (error) {
    await client.query("ROLLBACK");
    throw error;
  } finally {
    client.release();
  }
};

describe("calendar schema isolation", { timeout: 60_000 }, () => {
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

  it("shows a family calendar only inside its own family context", async () => {
    const familyId = randomUUID();
    const otherFamilyId = randomUUID();
    const calendarId = randomUUID();
    await db.admin.query(
      "INSERT INTO calendar.calendar (calendar_id, family_id, name) VALUES ($1, $2, 'Kitchen')",
      [calendarId, familyId],
    );

    expect(await selectCalendarsAs(db.pool, "app.family_id", familyId)).toEqual([
      { calendar_id: calendarId },
    ]);
    expect(await selectCalendarsAs(db.pool, "app.family_id", otherFamilyId)).toEqual([]);
  });

  it("shows a personal calendar only to its owner", async () => {
    const ownerId = randomUUID();
    const calendarId = randomUUID();
    await db.admin.query(
      "INSERT INTO calendar.calendar (calendar_id, user_id, name) VALUES ($1, $2, 'Work')",
      [calendarId, ownerId],
    );

    expect(await selectCalendarsAs(db.pool, "app.user_id", ownerId)).toEqual([
      { calendar_id: calendarId },
    ]);
    expect(await selectCalendarsAs(db.pool, "app.user_id", randomUUID())).toEqual([]);
  });

  it("shows no calendar when no owner context is set", async () => {
    await db.admin.query(
      "INSERT INTO calendar.calendar (calendar_id, family_id, name) VALUES ($1, $2, 'Kitchen')",
      [randomUUID(), randomUUID()],
    );

    expect(await selectCalendarsAs(db.pool, "app.family_id", null)).toEqual([]);
  });

  it("refuses a calendar that has both a family and a user owner", async () => {
    await expect(
      db.admin.query(
        "INSERT INTO calendar.calendar (calendar_id, family_id, user_id, name) VALUES ($1, $2, $3, 'Both')",
        [randomUUID(), randomUUID(), randomUUID()],
      ),
    ).rejects.toThrow(/calendar_one_owner/);
  });
});
