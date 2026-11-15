// SPDX-FileCopyrightText: 2026 Dominik Wadowski
// SPDX-License-Identifier: FSL-1.1-ALv2

import { randomUUID } from "node:crypto";
import { familyMemberAddedV1, familyMemberRemovedV1 } from "@offgrid/contracts";
import {
  createEventBus,
  publishOwnedEvent,
  replayEvents,
  withTransaction,
} from "@offgrid/event-bus";
import { createMemoryErrorSink } from "@offgrid/observability";
import { afterAll, beforeAll, beforeEach, describe, expect, it } from "vitest";
import { startCalendarTestDatabase } from "../../../test/start-calendar-test-database.js";
import type { CalendarTestDatabase } from "../../../test/types.js";
import {
  familyMembershipHandler,
  registerFamilyMembershipSubscribers,
} from "./register-family-membership-subscribers.js";

describe("family membership replay", { timeout: 60_000 }, () => {
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

  const replayMembership = () =>
    replayEvents(
      {
        events: [familyMemberAddedV1, familyMemberRemovedV1],
        runAs: "calendar",
        handler: familyMembershipHandler(db.db),
      },
      { pool: db.pool },
    );

  const clearProjection = () => db.admin.query("TRUNCATE calendar.family_membership");

  const stored = async () => {
    const { rows } = await db.admin.query<{ source_version: number; is_member: boolean }>(
      "SELECT source_version, is_member FROM calendar.family_membership WHERE family_id = $1 AND user_id = $2",
      [familyId, userId],
    );
    return rows[0];
  };

  it("rebuilds a join, a leave and a rejoin into the same row as the live projection", async () => {
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
    const live = await stored();
    expect(live).toEqual({ source_version: 3, is_member: true });

    await clearProjection();
    expect(await stored()).toBeUndefined();

    expect(await replayMembership()).toBe(3);
    expect(await stored()).toEqual(live);
  });

  it("does not change the projection when the same events are replayed again", async () => {
    await publishJoin(1);
    await publishLeave(2);
    await publishJoin(3);
    await clearProjection();
    await replayMembership();
    const afterFirst = await stored();

    await replayMembership();

    expect(await stored()).toEqual(afterFirst);
  });

  it("leaves a person denied when only a leave is replayed", async () => {
    await publishLeave(1);
    await clearProjection();

    await replayMembership();

    expect(await stored()).toEqual({ source_version: 1, is_member: false });
  });
});
