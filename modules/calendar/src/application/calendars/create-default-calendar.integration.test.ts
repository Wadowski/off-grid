// SPDX-FileCopyrightText: 2026 Dominik Wadowski
// SPDX-License-Identifier: FSL-1.1-ALv2

import { randomUUID } from "node:crypto";
import { setPgUserContext } from "@offgrid/db";
import { withTransaction } from "@offgrid/event-bus";
import type { PoolClient } from "pg";
import { afterAll, beforeAll, beforeEach, describe, expect, it } from "vitest";
import { startCalendarTestDatabase } from "../../../test/start-calendar-test-database.js";
import type { CalendarTestDatabase } from "../../../test/types.js";
import { createDefaultCalendar } from "./create-default-calendar.js";

describe("createDefaultCalendar", { timeout: 60_000 }, () => {
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

  const inUserContext = <T>(userId: string, work: (client: PoolClient) => Promise<T>) =>
    withTransaction(db.pool, async (client) => {
      await setPgUserContext(client, userId);
      return work(client);
    });

  const defaultCalendarsOf = (userId: string) =>
    inUserContext(userId, async (client) => {
      const { rows } = await client.query<{
        user_id: string;
        family_id: string | null;
        name: string;
        color: string;
        is_default: boolean;
      }>("SELECT user_id, family_id, name, color, is_default FROM calendar.calendar");
      return rows;
    });

  it("creates a personal blue default calendar for a new user", async () => {
    const userId = randomUUID();

    await inUserContext(userId, (client) => createDefaultCalendar(client, userId));

    expect(await defaultCalendarsOf(userId)).toEqual([
      { user_id: userId, family_id: null, name: "Personal", color: "blue", is_default: true },
    ]);
  });

  it("creates no second default calendar when the user already has one", async () => {
    const userId = randomUUID();

    await inUserContext(userId, (client) => createDefaultCalendar(client, userId));
    await inUserContext(userId, (client) => createDefaultCalendar(client, userId));

    expect(await defaultCalendarsOf(userId)).toHaveLength(1);
  });

  it("hides a user's default calendar from other users", async () => {
    const userId = randomUUID();
    const otherUserId = randomUUID();

    await inUserContext(userId, (client) => createDefaultCalendar(client, userId));

    expect(await defaultCalendarsOf(otherUserId)).toEqual([]);
  });
});
