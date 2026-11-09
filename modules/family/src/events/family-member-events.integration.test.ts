// SPDX-FileCopyrightText: 2026 Dominik Wadowski
// SPDX-License-Identifier: FSL-1.1-ALv2

import { randomUUID } from "node:crypto";
import { familyMemberRemovedV1 } from "@offgrid/contracts";
import { createEventBus } from "@offgrid/event-bus";
import { createMemoryErrorSink } from "@offgrid/observability";
import { withFamilyContext } from "@offgrid/db";
import { afterAll, beforeAll, beforeEach, describe, expect, it } from "vitest";
import {
  startFamilyTestDatabase,
  type FamilyTestDatabase,
} from "../../test/start-family-test-database.js";
import { publishFamilyEvent } from "./publish-family-event.js";

describe("family member events", { timeout: 60_000 }, () => {
  let db: FamilyTestDatabase;

  beforeAll(async () => {
    db = await startFamilyTestDatabase();
  }, 120_000);

  afterAll(async () => {
    await db.stop();
  }, 120_000);

  beforeEach(async () => {
    await db.reset();
  });

  it("dead-letters a removal event that a subscriber keeps failing to handle", async () => {
    const familyId = randomUUID();
    await db.db.$transaction(async (tx) => {
      await withFamilyContext(tx, familyId);
      await tx.family.create({ data: { familyId, name: "Failing subscriber" } });
      await publishFamilyEvent(tx, familyMemberRemovedV1, familyId, { userId: randomUUID() });
    });
    const bus = createEventBus({
      pool: db.pool,
      errorSink: createMemoryErrorSink(),
      retryDelayMs: () => 0,
    });
    bus.subscribe({
      name: "always-fails",
      event: familyMemberRemovedV1,
      runAs: "family",
      handler: async () => {
        throw new Error("subscriber broke");
      },
    });

    await bus.deliverPending();

    const { rows } = await db.admin.query<{ event_type: string; attempts: number }>(
      "SELECT event_type, attempts FROM outbox.dead_letter WHERE family_id = $1",
      [familyId],
    );
    expect(rows).toEqual([{ event_type: "family-member-removed-v1", attempts: 3 }]);
  });
});
