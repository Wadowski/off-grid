// SPDX-FileCopyrightText: 2026 Dominik Wadowski
// SPDX-License-Identifier: FSL-1.1-ALv2

import { randomUUID } from "node:crypto";
import { withUserContext } from "@offgrid/db";
import { afterAll, beforeAll, beforeEach, describe, expect, it } from "vitest";
import { startCalendarTestDatabase } from "../../../test/start-calendar-test-database.js";
import type { CalendarTestDatabase } from "../../../test/types.js";
import { publishCalendarReminderDue } from "./publish-calendar-reminder-due.js";

describe("publishCalendarReminderDue", { timeout: 60_000 }, () => {
  let db: CalendarTestDatabase;

  beforeAll(async () => {
    db = await startCalendarTestDatabase();
  }, 120_000);

  afterAll(async () => {
    await db.stop();
  }, 120_000);

  beforeEach(async () => {
    await db.reset();
    await db.admin.query("TRUNCATE outbox.event");
  });

  it("writes a fact whose payload is exactly the event and recipient ids", async () => {
    const userId = randomUUID();
    const eventId = randomUUID();
    await db.db.$transaction(async (tx) => {
      await withUserContext(tx, userId);
      await publishCalendarReminderDue(tx, { eventId, userId });
    });
    const { rows } = await db.admin.query<{ type: string; user_id: string; payload: unknown }>(
      "SELECT type, user_id, payload FROM outbox.event WHERE type = 'calendar-reminder-due-v1'",
    );
    expect(rows).toHaveLength(1);
    expect(rows[0].user_id).toBe(userId);
    expect(rows[0].payload).toEqual({ eventId, userId });
  });

  it("is rolled back with the transaction that wrote it", async () => {
    const userId = randomUUID();
    await expect(
      db.db.$transaction(async (tx) => {
        await withUserContext(tx, userId);
        await publishCalendarReminderDue(tx, { eventId: randomUUID(), userId });
        throw new Error("rollback");
      }),
    ).rejects.toThrow("rollback");
    const { rows } = await db.admin.query(
      "SELECT 1 FROM outbox.event WHERE type = 'calendar-reminder-due-v1'",
    );
    expect(rows).toHaveLength(0);
  });
});
