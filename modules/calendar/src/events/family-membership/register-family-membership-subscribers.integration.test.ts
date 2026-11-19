// SPDX-FileCopyrightText: 2026 Dominik Wadowski
// SPDX-License-Identifier: FSL-1.1-ALv2

import { randomUUID } from "node:crypto";
import { familyMemberAddedV1, familyMemberRemovedV1 } from "@offgrid/contracts";
import { createEventBus, publishOwnedEvent, withTransaction } from "@offgrid/event-bus";
import { createMemoryErrorSink } from "@offgrid/observability";
import { afterAll, beforeAll, beforeEach, describe, expect, it } from "vitest";
import { startCalendarTestDatabase } from "../../../test/start-calendar-test-database.js";
import type { CalendarTestDatabase } from "../../../test/types.js";
import { readFamilyMembership } from "../../../test/family-membership.js";
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
    registerFamilyMembershipSubscribers({ eventBus: bus, db: db.db });

    await bus.deliverPending();

    expect(await readFamilyMembership(db.admin, familyId, legacyUser)).toBeUndefined();
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
    registerFamilyMembershipSubscribers({ eventBus: bus, db: db.db });

    await bus.deliverPending();

    expect(await readFamilyMembership(db.admin, familyId, userId)).toEqual({
      source_version: 3,
      is_member: true,
    });
  });

  it("follows a join, a leave and a rejoin delivered one at a time", async () => {
    const bus = createEventBus({
      pool: db.pool,
      errorSink: createMemoryErrorSink(),
      retryDelayMs: () => 0,
    });
    registerFamilyMembershipSubscribers({ eventBus: bus, db: db.db });
    const row = () => readFamilyMembership(db.admin, familyId, userId);

    await publishJoin(1);
    await bus.deliverPending();
    expect(await row()).toEqual({ source_version: 1, is_member: true });

    await publishLeave(2);
    await bus.deliverPending();
    expect(await row()).toEqual({ source_version: 2, is_member: false });

    await publishJoin(3);
    await bus.deliverPending();
    expect(await row()).toEqual({ source_version: 3, is_member: true });
  });
});
