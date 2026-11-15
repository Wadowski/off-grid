// SPDX-FileCopyrightText: 2026 Dominik Wadowski
// SPDX-License-Identifier: FSL-1.1-ALv2

import { randomUUID } from "node:crypto";
import { defineEvent } from "@offgrid/contracts";
import type { Pool } from "pg";
import { z } from "zod";
import { afterAll, beforeAll, beforeEach, describe, expect, it } from "vitest";
import { publish, replayEvents } from "./index.js";
import { familyCreated } from "../test/family-created.js";
import { startTestDatabase } from "../test/start-test-database.js";
import type { TestDatabase } from "../test/types.js";

const FAMILY_ID = randomUUID();

const familyRenamed = defineEvent({
  name: "family-renamed-v1",
  version: 1,
  schema: z.object({ name: z.string().min(1).max(100) }),
});

const RESET_TABLES =
  "TRUNCATE outbox.event, outbox.subscriber_cursor, outbox.dead_letter RESTART IDENTITY";

const publishCommitted = async (
  pool: Pool,
  definition: typeof familyCreated | typeof familyRenamed,
  sourceVersion: number,
): Promise<void> => {
  const client = await pool.connect();
  try {
    await client.query("BEGIN");
    await publish(client, definition, {
      id: randomUUID(),
      type: definition.name,
      version: definition.version,
      occurredAt: new Date().toISOString(),
      traceId: "trace-under-test",
      familyId: FAMILY_ID,
      sourceVersion,
      payload: { name: `Name ${sourceVersion}` },
    });
    await client.query("COMMIT");
  } finally {
    client.release();
  }
};

interface Seen {
  readonly type: string;
  readonly sourceVersion: number;
}

describe("replayEvents", () => {
  let db: TestDatabase;
  let outbox: Pool;

  beforeAll(async () => {
    db = await startTestDatabase();
    outbox = db.connect();
  }, 120_000);

  afterAll(async () => {
    await db.stop();
  });

  beforeEach(async () => {
    await db.admin.query(RESET_TABLES);
  });

  it("replays several event types in sequence order", async () => {
    await publishCommitted(outbox, familyCreated, 1);
    await publishCommitted(outbox, familyRenamed, 2);
    await publishCommitted(outbox, familyCreated, 3);
    await publishCommitted(outbox, familyRenamed, 4);
    const seen: Seen[] = [];

    const replayed = await replayEvents(
      {
        events: [familyCreated, familyRenamed],
        runAs: "family",
        handler: async (event) => {
          seen.push({ type: event.type, sourceVersion: event.sourceVersion });
        },
      },
      { pool: outbox },
    );

    expect(replayed).toBe(4);
    expect(seen).toEqual([
      { type: "family-created-v1", sourceVersion: 1 },
      { type: "family-renamed-v1", sourceVersion: 2 },
      { type: "family-created-v1", sourceVersion: 3 },
      { type: "family-renamed-v1", sourceVersion: 4 },
    ]);
  });

  it("replays only the events of the subscription in multi-event form", async () => {
    await publishCommitted(outbox, familyCreated, 1);
    await publishCommitted(outbox, familyRenamed, 2);
    const seen: Seen[] = [];

    const replayed = await replayEvents(
      {
        events: [familyRenamed],
        runAs: "family",
        handler: async (event) => {
          seen.push({ type: event.type, sourceVersion: event.sourceVersion });
        },
      },
      { pool: outbox },
    );

    expect(replayed).toBe(1);
    expect(seen).toEqual([{ type: "family-renamed-v1", sourceVersion: 2 }]);
  });

  it("keeps the single-event form replaying only its own event type", async () => {
    await publishCommitted(outbox, familyCreated, 1);
    await publishCommitted(outbox, familyRenamed, 2);
    await publishCommitted(outbox, familyCreated, 3);
    const seen: Seen[] = [];

    const replayed = await replayEvents(
      {
        event: familyCreated,
        runAs: "family",
        handler: async (event) => {
          seen.push({ type: event.type, sourceVersion: event.sourceVersion });
        },
      },
      { pool: outbox },
    );

    expect(replayed).toBe(2);
    expect(seen).toEqual([
      { type: "family-created-v1", sourceVersion: 1 },
      { type: "family-created-v1", sourceVersion: 3 },
    ]);
  });

  it("starts the replay at the given sequence", async () => {
    await publishCommitted(outbox, familyCreated, 1);
    await publishCommitted(outbox, familyRenamed, 2);
    await publishCommitted(outbox, familyCreated, 3);
    const seen: Seen[] = [];

    const replayed = await replayEvents(
      {
        events: [familyCreated, familyRenamed],
        runAs: "family",
        handler: async (event) => {
          seen.push({ type: event.type, sourceVersion: event.sourceVersion });
        },
      },
      { pool: outbox, fromSequence: 2 },
    );

    expect(replayed).toBe(2);
    expect(seen.map((entry) => entry.sourceVersion)).toEqual([2, 3]);
  });

  it("reads past a full batch of events of other types", async () => {
    await publishCommitted(outbox, familyRenamed, 1);
    await publishCommitted(outbox, familyRenamed, 2);
    await publishCommitted(outbox, familyRenamed, 3);
    await publishCommitted(outbox, familyCreated, 4);
    const seen: Seen[] = [];

    const replayed = await replayEvents(
      {
        event: familyCreated,
        runAs: "family",
        handler: async (event) => {
          seen.push({ type: event.type, sourceVersion: event.sourceVersion });
        },
      },
      { pool: outbox, batchSize: 2 },
    );

    expect(replayed).toBe(1);
    expect(seen).toEqual([{ type: "family-created-v1", sourceVersion: 4 }]);
  });
});
