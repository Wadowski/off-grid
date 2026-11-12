// SPDX-FileCopyrightText: 2026 Dominik Wadowski
// SPDX-License-Identifier: FSL-1.1-ALv2

import { randomUUID } from "node:crypto";
import { familyMemberAddedV1, familyMemberRemovedV1 } from "@offgrid/contracts";
import { createEventBus, publishOwnedEvent, withTransaction } from "@offgrid/event-bus";
import { createMemoryErrorSink } from "@offgrid/observability";
import { afterAll, beforeAll, beforeEach, describe, expect, it } from "vitest";
import { startCalendarTestDatabase } from "../../../test/start-calendar-test-database.js";
import type { CalendarTestDatabase } from "../../../test/types.js";
import { registerFamilyMembershipSubscribers } from "./register-family-membership-subscribers.js";

describe("family membership subscriber", { timeout: 60_000 }, () => {
  let db: CalendarTestDatabase;
  const familyId = randomUUID();
  const userId = randomUUID();

  beforeAll(async () => {
    db = await startCalendarTestDatabase();
  }, 120_000);

  afterAll(async () => {
    await db.stop();
  }, 120_000);

  beforeEach(async () => {
    await db.reset();
    await db.admin.query("TRUNCATE outbox.event, outbox.subscriber_cursor, outbox.dead_letter");
  });

  const publishJoin = (sourceVersion: number) =>
    withTransaction(db.pool, (client) =>
      publishOwnedEvent(
        client,
        familyMemberAddedV1,
        { familyId, sourceVersion },
        { userId, role: "member" },
      ),
    );

  const publishLeave = (sourceVersion: number) =>
    withTransaction(db.pool, (client) =>
      publishOwnedEvent(client, familyMemberRemovedV1, { familyId, sourceVersion }, { userId }),
    );

  it("does not apply membership events published before the projection, so a person who left earlier stays denied", async () => {
    const legacyUser = randomUUID();
    await withTransaction(db.pool, async (client) => {
      await publishOwnedEvent(
        client,
        familyMemberAddedV1,
        { familyId, sourceVersion: 1 },
        { userId: legacyUser, role: "member" },
      );
      await publishOwnedEvent(
        client,
        familyMemberRemovedV1,
        { familyId, sourceVersion: 1 },
        { userId: legacyUser },
      );
    });
    // Same statement as the migration: the subscriber starts after the events that exist now.
    await db.admin.query(
      `INSERT INTO outbox.subscriber_cursor (subscriber, last_sequence)
       SELECT 'calendar-family-membership', COALESCE(max(sequence), 0) FROM outbox.event
       ON CONFLICT (subscriber) DO NOTHING`,
    );
    const bus = createEventBus({
      pool: db.pool,
      errorSink: createMemoryErrorSink(),
      retryDelayMs: () => 0,
    });
    registerFamilyMembershipSubscribers(bus);

    await bus.deliverPending();

    const { rows } = await db.admin.query(
      "SELECT is_member FROM calendar.family_membership WHERE family_id = $1 AND user_id = $2",
      [familyId, legacyUser],
    );
    expect(rows).toEqual([]);
  });

  it("applies a removal and a later rejoin, pending together, in the order the family made them", async () => {
    await publishJoin(1);
    await publishLeave(2);
    await publishJoin(3);
    const bus = createEventBus({
      pool: db.pool,
      errorSink: createMemoryErrorSink(),
      retryDelayMs: () => 0,
    });
    registerFamilyMembershipSubscribers(bus);

    await bus.deliverPending();

    const { rows } = await db.admin.query<{ source_version: number; is_member: boolean }>(
      "SELECT source_version, is_member FROM calendar.family_membership WHERE family_id = $1 AND user_id = $2",
      [familyId, userId],
    );
    expect(rows[0]).toEqual({ source_version: 3, is_member: true });
  });
});
