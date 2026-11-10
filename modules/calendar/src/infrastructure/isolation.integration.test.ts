// SPDX-FileCopyrightText: 2026 Dominik Wadowski
// SPDX-License-Identifier: FSL-1.1-ALv2

import { randomUUID } from "node:crypto";
import { withFamilyContext, withUserContext } from "@offgrid/db";
import { afterAll, beforeAll, beforeEach, describe, expect, it } from "vitest";
import { startCalendarTestDatabase } from "../../test/start-calendar-test-database.js";
import type { CalendarTestDatabase } from "../../test/types.js";

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
    await db.db.$transaction(async (tx) => {
      await withFamilyContext(tx, familyId);
      await tx.calendar.create({ data: { calendarId, familyId, name: "Kitchen" } });
    });

    const visibleToFamily = await db.db.$transaction(async (tx) => {
      await withFamilyContext(tx, familyId);
      return tx.calendar.findMany();
    });
    const visibleToOtherFamily = await db.db.$transaction(async (tx) => {
      await withFamilyContext(tx, otherFamilyId);
      return tx.calendar.findMany();
    });

    expect(visibleToFamily.map((row) => row.calendarId)).toEqual([calendarId]);
    expect(visibleToOtherFamily).toEqual([]);
  });

  it("shows a personal calendar only to its owner", async () => {
    const ownerId = randomUUID();
    const calendarId = randomUUID();
    await db.db.$transaction(async (tx) => {
      await withUserContext(tx, ownerId);
      await tx.calendar.create({ data: { calendarId, userId: ownerId, name: "Work" } });
    });

    const visibleToOwner = await db.db.$transaction(async (tx) => {
      await withUserContext(tx, ownerId);
      return tx.calendar.findMany();
    });
    const visibleToOther = await db.db.$transaction(async (tx) => {
      await withUserContext(tx, randomUUID());
      return tx.calendar.findMany();
    });

    expect(visibleToOwner.map((row) => row.calendarId)).toEqual([calendarId]);
    expect(visibleToOther).toEqual([]);
  });

  it("shows no calendar when no owner context is set", async () => {
    const familyId = randomUUID();
    await db.db.$transaction(async (tx) => {
      await withFamilyContext(tx, familyId);
      await tx.calendar.create({ data: { calendarId: randomUUID(), familyId, name: "Kitchen" } });
    });

    const rows = await db.db.$transaction((tx) => tx.calendar.findMany());

    expect(rows).toEqual([]);
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
