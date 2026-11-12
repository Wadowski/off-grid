// SPDX-FileCopyrightText: 2026 Dominik Wadowski
// SPDX-License-Identifier: FSL-1.1-ALv2

import { randomUUID } from "node:crypto";
import { withUserContext } from "@offgrid/db";
import { afterAll, beforeAll, beforeEach, describe, expect, it } from "vitest";
import { startCalendarTestDatabase } from "../../../test/start-calendar-test-database.js";
import type { CalendarTestDatabase } from "../../../test/types.js";

describe("calendar user time zone isolation", { timeout: 60_000 }, () => {
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

  it("shows a time zone row only to its own user", async () => {
    const ownerId = randomUUID();
    await db.db.$transaction(async (tx) => {
      await withUserContext(tx, ownerId);
      await tx.userTimeZone.create({ data: { userId: ownerId, timeZone: "Europe/Warsaw" } });
    });

    const visibleToOwner = await db.db.$transaction(async (tx) => {
      await withUserContext(tx, ownerId);
      return tx.userTimeZone.findMany();
    });
    const visibleToOther = await db.db.$transaction(async (tx) => {
      await withUserContext(tx, randomUUID());
      return tx.userTimeZone.findMany();
    });

    expect(visibleToOwner.map((row) => row.timeZone)).toEqual(["Europe/Warsaw"]);
    expect(visibleToOther).toEqual([]);
  });

  it("refuses to write a time zone row for another user", async () => {
    const ownerId = randomUUID();
    await expect(
      db.db.$transaction(async (tx) => {
        await withUserContext(tx, randomUUID());
        await tx.userTimeZone.create({ data: { userId: ownerId, timeZone: "UTC" } });
      }),
    ).rejects.toThrow();

    const rows = await db.admin.query("SELECT user_id FROM calendar.user_time_zone");
    expect(rows.rows).toEqual([]);
  });

  it("refuses a time zone row without a user", async () => {
    await expect(
      db.admin.query(
        "INSERT INTO calendar.user_time_zone (user_id, time_zone) VALUES (NULL, 'UTC')",
      ),
    ).rejects.toThrow(/user_id/);
  });
});
