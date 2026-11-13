// SPDX-FileCopyrightText: 2026 Dominik Wadowski
// SPDX-License-Identifier: FSL-1.1-ALv2

import { randomUUID } from "node:crypto";
import { withUserContext } from "@offgrid/db";
import { afterAll, beforeAll, beforeEach, describe, expect, it } from "vitest";
import { startCalendarTestDatabase } from "../../../test/start-calendar-test-database.js";
import type { CalendarTestDatabase } from "../../../test/types.js";
import { findGuestCalendarFields } from "./find-guest-calendar-fields.js";

describe("findGuestCalendarFields", { timeout: 60_000 }, () => {
  let db: CalendarTestDatabase;
  const host = randomUUID();

  beforeAll(async () => {
    db = await startCalendarTestDatabase();
  }, 120_000);

  afterAll(async () => {
    await db.stop();
  }, 120_000);

  beforeEach(async () => {
    await db.reset();
  });

  it("returns the name and colour of the calendar", async () => {
    const calendarId = randomUUID();
    await db.admin.query(
      "INSERT INTO calendar.calendar (calendar_id, user_id, name, color) VALUES ($1, $2, 'Work', 'violet')",
      [calendarId, host],
    );

    const fields = await db.db.$transaction(async (tx) => {
      await withUserContext(tx, host);
      return findGuestCalendarFields(tx, calendarId);
    });

    expect(fields).toEqual({ calendarName: "Work", calendarColor: "violet" });
  });

  it("returns no name or colour when the calendar is not visible", async () => {
    const calendarId = randomUUID();
    await db.admin.query(
      "INSERT INTO calendar.calendar (calendar_id, user_id, name, color) VALUES ($1, $2, 'Work', 'violet')",
      [calendarId, host],
    );

    const fields = await db.db.$transaction(async (tx) => {
      await withUserContext(tx, randomUUID());
      return findGuestCalendarFields(tx, calendarId);
    });

    expect(fields).toEqual({ calendarName: undefined, calendarColor: undefined });
  });
});
