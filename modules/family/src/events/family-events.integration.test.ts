// SPDX-FileCopyrightText: 2026 Dominik Wadowski
// SPDX-License-Identifier: FSL-1.1-ALv2

import { randomUUID } from "node:crypto";
import { familyCreatedV1 } from "@offgrid/contracts";
import { createEventBus, publish, replayEvents, type EventBus } from "@offgrid/event-bus";
import { createMemoryErrorSink } from "@offgrid/observability";
import { afterAll, beforeAll, beforeEach, describe, expect, it } from "vitest";
import { startFamilyTestDatabase, type FamilyTestDatabase } from "../../test/postgres.js";
import { createFamily } from "../application/create-family.js";
import { listMyFamilies } from "../application/list-my-families.js";
import { setFamilyContext } from "../infrastructure/set-family-context.js";
import { withFamilyTransaction } from "../infrastructure/with-family-transaction.js";
import { publishFamilyCreated } from "./publish-family-created.js";
import { projectFamilyCreated } from "./project-family-created.js";
import { familySummarySubscription } from "./family-summary-subscription.js";

const DEAD_LETTER_SUBSCRIBER = "family-summary-gap-test";

const familyEnvelope = (familyId: string, creatorUserId: string, sourceVersion: number) => ({
  id: randomUUID(),
  type: familyCreatedV1.name,
  version: familyCreatedV1.version,
  occurredAt: new Date().toISOString(),
  traceId: "trace-under-test",
  familyId,
  sourceVersion,
  payload: { name: "Novak family", creatorUserId },
});

const parsedEvent = (envelope: ReturnType<typeof familyEnvelope>) =>
  familyCreatedV1.envelope.parse(envelope);

describe("family events", () => {
  let db: FamilyTestDatabase;

  beforeAll(async () => {
    db = await startFamilyTestDatabase();
  }, 120_000);

  afterAll(async () => {
    await db.stop();
  });

  beforeEach(async () => {
    await db.reset();
  });

  const startBus = (): EventBus =>
    createEventBus({
      pool: db.pool,
      errorSink: createMemoryErrorSink(),
      maxAttempts: 3,
      retryDelayMs: () => 0,
    });

  describe("atomic write", () => {
    it("drops the outbox event when the change rolls back", async () => {
      const familyId = randomUUID();

      await expect(
        withFamilyTransaction(db.pool, async (client) => {
          await setFamilyContext(client, familyId);
          await client.query(
            "INSERT INTO family.family (family_id, name) VALUES ($1, 'Rolled back')",
            [familyId],
          );
          await publishFamilyCreated(client, {
            familyId,
            name: "Rolled back",
            creatorUserId: randomUUID(),
          });
          throw new Error("change failed");
        }),
      ).rejects.toThrow("change failed");

      const { rows } = await db.admin.query(
        "SELECT count(*)::int AS n FROM outbox.event WHERE family_id = $1",
        [familyId],
      );
      expect(rows[0]).toEqual({ n: 0 });
    });
  });

  describe("projection", () => {
    it("publishes family-created-v1 and projects it for the creator", async () => {
      const bus = startBus();
      bus.subscribe(familySummarySubscription);
      const creator = randomUUID();
      const family = await createFamily(db.pool, creator, "Novak family");

      await bus.deliverPending();

      expect(await listMyFamilies(db.pool, creator)).toEqual([
        { id: family.id, name: "Novak family" },
      ]);
      expect(await listMyFamilies(db.pool, randomUUID())).toEqual([]);
    });

    it("applies a repeated event once", async () => {
      const familyId = randomUUID();
      const creator = randomUUID();
      const event = parsedEvent(familyEnvelope(familyId, creator, 1));

      await withFamilyTransaction(db.pool, async (client) => {
        await projectFamilyCreated(event, { tx: client });
        await projectFamilyCreated(event, { tx: client });
      });

      const { rows } = await db.admin.query(
        "SELECT count(*)::int AS n FROM family.family_summary WHERE family_id = $1",
        [familyId],
      );
      expect(rows[0]).toEqual({ n: 1 });
    });

    it("ignores a stale version", async () => {
      const familyId = randomUUID();
      const creator = randomUUID();
      await db.admin.query(
        "INSERT INTO family.family_summary (user_id, family_id, name, source_version) VALUES ($1, $2, 'Renamed', 3)",
        [creator, familyId],
      );

      await withFamilyTransaction(db.pool, (client) =>
        projectFamilyCreated(parsedEvent(familyEnvelope(familyId, creator, 1)), { tx: client }),
      );

      const { rows } = await db.admin.query(
        "SELECT name, source_version FROM family.family_summary WHERE family_id = $1",
        [familyId],
      );
      expect(rows).toEqual([{ name: "Renamed", source_version: "3" }]);
    });

    it("moves an event that keeps failing to the dead-letter store", async () => {
      const bus = startBus();
      bus.subscribe({ ...familySummarySubscription, name: DEAD_LETTER_SUBSCRIBER });
      const familyId = randomUUID();
      const creator = randomUUID();
      await withFamilyTransaction(db.pool, (client) =>
        publish(client, familyCreatedV1, familyEnvelope(familyId, creator, 2)),
      );

      await bus.deliverPending();

      const { rows } = await db.admin.query(
        "SELECT subscriber, event_id, attempts, error_name FROM outbox.dead_letter",
      );
      expect(rows).toEqual([
        {
          subscriber: DEAD_LETTER_SUBSCRIBER,
          event_id: expect.any(String),
          attempts: 3,
          error_name: "Error",
        },
      ]);
    });

    it("rebuilds the projection by replaying the event stream", async () => {
      const creator = randomUUID();
      const first = await createFamily(db.pool, creator, "Novak family");
      const second = await createFamily(db.pool, creator, "Office");
      await db.admin.query("TRUNCATE family.family_summary");

      const replayed = await replayEvents(
        { event: familyCreatedV1, runAs: "family", handler: projectFamilyCreated },
        { pool: db.pool },
      );

      expect(replayed).toBe(2);
      const rebuilt = await listMyFamilies(db.pool, creator);
      expect(rebuilt).toHaveLength(2);
      expect(rebuilt.map((family) => family.id).sort()).toEqual([first.id, second.id].sort());
    });
  });
});
