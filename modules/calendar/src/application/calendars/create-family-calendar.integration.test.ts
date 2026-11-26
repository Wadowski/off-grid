// SPDX-FileCopyrightText: 2026 Dominik Wadowski
// SPDX-License-Identifier: FSL-1.1-ALv2

import { randomUUID } from "node:crypto";
import { afterAll, beforeAll, beforeEach, describe, expect, it } from "vitest";
import { startCalendarTestDatabase } from "../../../test/start-calendar-test-database.js";
import type { CalendarTestDatabase } from "../../../test/types.js";
import { createFamilyCalendar } from "./create-family-calendar.js";

describe("createFamilyCalendar", { timeout: 60_000 }, () => {
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

  const familyCalendarsOf = async (familyId: string) => {
    const { rows } = await db.admin.query<{
      family_id: string;
      user_id: string | null;
      name: string;
      color: string;
      is_default: boolean;
    }>(
      "SELECT family_id, user_id, name, color, is_default FROM calendar.calendar WHERE family_id = $1",
      [familyId],
    );
    return rows;
  };

  const createIn = (familyId: string, familyName: string) =>
    db.db.$transaction((tx) => createFamilyCalendar(tx, familyId, familyName));

  it("creates one blue default calendar owned by the family, named after it", async () => {
    const familyId = randomUUID();

    await createIn(familyId, "The Smiths");

    expect(await familyCalendarsOf(familyId)).toEqual([
      { family_id: familyId, user_id: null, name: "The Smiths", color: "blue", is_default: true },
    ]);
  });

  it("creates no second family calendar when the family already has one", async () => {
    const familyId = randomUUID();

    await createIn(familyId, "The Smiths");
    await createIn(familyId, "The Smiths");

    expect(await familyCalendarsOf(familyId)).toHaveLength(1);
  });

  it("creates one family calendar for each of two families", async () => {
    const smiths = randomUUID();
    const joneses = randomUUID();

    await createIn(smiths, "The Smiths");
    await createIn(joneses, "The Joneses");

    expect(await familyCalendarsOf(smiths)).toHaveLength(1);
    expect(await familyCalendarsOf(joneses)).toHaveLength(1);
  });
});
