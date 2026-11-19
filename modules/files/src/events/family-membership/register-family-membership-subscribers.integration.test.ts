// SPDX-FileCopyrightText: 2026 Dominik Wadowski
// SPDX-License-Identifier: FSL-1.1-ALv2

import { randomUUID } from "node:crypto";
import { familyMemberAddedV1, familyMemberRemovedV1 } from "@offgrid/contracts";
import { createEventBus, publishOwnedEvent, withTransaction } from "@offgrid/event-bus";
import { createMemoryErrorSink } from "@offgrid/observability";
import { afterAll, beforeAll, beforeEach, describe, expect, it } from "vitest";
import { readFamilyMembership } from "../../../test/family-membership.js";
import { startFilesTestDatabase } from "../../../test/start-files-test-database.js";
import type { FilesTestDatabase } from "../../../test/types.js";
import { registerFamilyMembershipSubscribers } from "./register-family-membership-subscribers.js";

describe("family membership subscriber", { timeout: 60_000 }, () => {
  let db: FilesTestDatabase;
  const familyId = randomUUID();
  const userId = randomUUID();

  beforeAll(async () => {
    db = await startFilesTestDatabase();
  }, 120_000);

  afterAll(async () => {
    await db.stop();
  }, 120_000);

  beforeEach(async () => {
    await db.reset();
    await db.admin.query("TRUNCATE outbox.event, outbox.subscriber_cursor, outbox.dead_letter");
  });

  const publishJoin = (sourceVersion: number, member = userId) =>
    withTransaction(db.pool, (client) =>
      publishOwnedEvent(
        client,
        familyMemberAddedV1,
        { familyId, sourceVersion },
        { userId: member, role: "member" },
      ),
    );

  const publishLeave = (sourceVersion: number) =>
    withTransaction(db.pool, (client) =>
      publishOwnedEvent(client, familyMemberRemovedV1, { familyId, sourceVersion }, { userId }),
    );

  const createBus = () =>
    createEventBus({
      pool: db.pool,
      errorSink: createMemoryErrorSink(),
      retryDelayMs: () => 0,
    });

  const stored = (member = userId) => readFamilyMembership(db.admin, familyId, member);

  it("does not apply membership events published before the projection, so a person who left earlier stays denied", async () => {
    const legacyUser = randomUUID();
    await publishJoin(1, legacyUser);
    await withTransaction(db.pool, (client) =>
      publishOwnedEvent(
        client,
        familyMemberRemovedV1,
        { familyId, sourceVersion: 1 },
        { userId: legacyUser },
      ),
    );
    await db.admin.query(
      `INSERT INTO outbox.subscriber_cursor (subscriber, last_sequence)
       SELECT 'files-family-membership', COALESCE(max(sequence), 0) FROM outbox.event
       ON CONFLICT (subscriber) DO NOTHING`,
    );
    const bus = createBus();
    registerFamilyMembershipSubscribers({ eventBus: bus, db: db.db });

    await bus.deliverPending();

    expect(await stored(legacyUser)).toBeUndefined();
  });

  it("applies a removal and a later rejoin, pending together, in the order the family made them", async () => {
    await publishJoin(1);
    await publishLeave(2);
    await publishJoin(3);
    const bus = createBus();
    registerFamilyMembershipSubscribers({ eventBus: bus, db: db.db });

    await bus.deliverPending();

    expect(await stored()).toEqual({ source_version: 3, is_member: true });
  });

  it("follows a join, a leave and a rejoin delivered one at a time", async () => {
    const bus = createBus();
    registerFamilyMembershipSubscribers({ eventBus: bus, db: db.db });

    await publishJoin(1);
    await bus.deliverPending();
    expect(await stored()).toEqual({ source_version: 1, is_member: true });

    await publishLeave(2);
    await bus.deliverPending();
    expect(await stored()).toEqual({ source_version: 2, is_member: false });

    await publishJoin(3);
    await bus.deliverPending();
    expect(await stored()).toEqual({ source_version: 3, is_member: true });
  });

  it("halts on a gap and records the error, so later changes wait", async () => {
    const errorSink = createMemoryErrorSink();
    const bus = createEventBus({ pool: db.pool, errorSink, retryDelayMs: () => 0 });
    registerFamilyMembershipSubscribers({ eventBus: bus, db: db.db });

    await publishJoin(1);
    await bus.deliverPending();
    await publishJoin(3);
    await publishLeave(4);
    await bus.deliverPending();

    expect(errorSink.list().length).toBeGreaterThan(0);
    expect(await stored()).toEqual({ source_version: 1, is_member: true });
  });
});
