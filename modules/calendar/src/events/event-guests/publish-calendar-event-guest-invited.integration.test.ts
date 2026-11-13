// SPDX-FileCopyrightText: 2026 Dominik Wadowski
// SPDX-License-Identifier: FSL-1.1-ALv2

import { randomUUID } from "node:crypto";
import { withUserContext, type ModuleTransaction } from "@offgrid/db";
import { afterAll, beforeAll, beforeEach, describe, expect, it } from "vitest";
import { startCalendarTestDatabase } from "../../../test/start-calendar-test-database.js";
import type { CalendarTestDatabase } from "../../../test/types.js";
import { publishCalendarEventGuestInvited } from "./publish-calendar-event-guest-invited.js";

describe("publishCalendarEventGuestInvited", { timeout: 60_000 }, () => {
  let db: CalendarTestDatabase;
  const host = randomUUID();
  const guest = randomUUID();
  const calendarId = randomUUID();
  const eventId = randomUUID();

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

  const publish = (tx: ModuleTransaction) =>
    publishCalendarEventGuestInvited(tx, {
      hostUserId: host,
      sourceVersion: 1,
      eventId,
      guestUserId: guest,
      calendarId,
    });

  const outboxTypes = async (): Promise<string[]> => {
    const { rows } = await db.admin.query<{ type: string }>("SELECT type FROM outbox.event");
    return rows.map((row) => row.type);
  };

  it("writes the fact to the outbox when the transaction commits", async () => {
    await db.db.$transaction(async (tx) => {
      await withUserContext(tx, host);
      await publish(tx);
    });

    expect(await outboxTypes()).toEqual(["calendar-event-guest-invited-v1"]);
  });

  it("writes nothing to the outbox when the transaction rolls back", async () => {
    await expect(
      db.db.$transaction(async (tx) => {
        await withUserContext(tx, host);
        await publish(tx);
        throw new Error("roll back");
      }),
    ).rejects.toThrow("roll back");

    expect(await outboxTypes()).toEqual([]);
  });
});
