// SPDX-FileCopyrightText: 2026 Dominik Wadowski
// SPDX-License-Identifier: FSL-1.1-ALv2

import { randomUUID } from "node:crypto";
import { familyCreatedV1 } from "@offgrid/contracts";
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
import { familyCalendarSubscription } from "./family-calendar-subscription.js";
import { registerFamilyCalendarSubscribers } from "./register-family-calendar-subscribers.js";

describe("family calendar subscribers", { timeout: 60_000 }, () => {
  let db: CalendarTestDatabase;

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

  const publishFamilyCreated = (familyId: string, name: string) =>
    withTransaction(db.pool, (client) =>
      publishOwnedEvent(client, familyCreatedV1, { familyId }, { name }),
    );

  const createBus = () =>
    createEventBus({
      pool: db.pool,
      errorSink: createMemoryErrorSink(),
      retryDelayMs: () => 0,
    });

  const familyCalendarsOf = async (familyId: string) => {
    const { rows } = await db.admin.query<{ name: string; is_default: boolean }>(
      "SELECT name, is_default FROM calendar.calendar WHERE family_id = $1",
      [familyId],
    );
    return rows;
  };

  it("creates one family calendar when family-created is delivered twice", async () => {
    const familyId = randomUUID();
    await publishFamilyCreated(familyId, "The Smiths");
    await publishFamilyCreated(familyId, "The Smiths");
    const bus = createBus();
    registerFamilyCalendarSubscribers({ eventBus: bus, db: db.db });

    await bus.deliverPending();

    expect(await familyCalendarsOf(familyId)).toEqual([{ name: "The Smiths", is_default: true }]);
  });

  it("creates the family calendar before any member row exists", async () => {
    const familyId = randomUUID();
    await publishFamilyCreated(familyId, "The Smiths");
    const bus = createBus();
    registerFamilyCalendarSubscribers({ eventBus: bus, db: db.db });

    await bus.deliverPending();

    expect(await familyCalendarsOf(familyId)).toHaveLength(1);
  });

  it("leaves one family calendar when the subscription is replayed", async () => {
    const familyId = randomUUID();
    await publishFamilyCreated(familyId, "The Smiths");
    const bus = createBus();
    registerFamilyCalendarSubscribers({ eventBus: bus, db: db.db });
    await bus.deliverPending();

    await replayEvents(familyCalendarSubscription(db.db), { pool: db.pool });

    expect(await familyCalendarsOf(familyId)).toHaveLength(1);
  });

  it("refuses to create a family calendar for an event without a family id", async () => {
    const handler = familyCalendarSubscription(db.db).handler;

    await expect(handler({ familyId: null, payload: { name: "The Smiths" } })).rejects.toThrow(
      "family-created event has no family id",
    );
  });
});
