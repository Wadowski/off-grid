// SPDX-FileCopyrightText: 2026 Dominik Wadowski
// SPDX-License-Identifier: FSL-1.1-ALv2

import { randomUUID } from "node:crypto";
import { defineEvent } from "@offgrid/contracts";
import { createMemoryErrorSink } from "@offgrid/observability";
import type { Pool } from "pg";
import { afterAll, beforeAll, beforeEach, describe, expect, it, vi } from "vitest";
import { z } from "zod";
import {
  classifySourceVersion,
  createEventBus,
  publish,
  type HandlerContext,
  replayEvents,
  type EventBus,
  type EventOf,
} from "./index.js";
import { startTestDatabase, type TestDatabase } from "../test/postgres.js";

const familyCreated = defineEvent({
  name: "family-created-v1",
  version: 1,
  schema: z.object({ name: z.string().min(1).max(100) }),
});

type FamilyCreated = EventOf<typeof familyCreated>;

const FAMILY_ID = randomUUID();

function envelope(sourceVersion: number, name: string, familyId: string | null = FAMILY_ID) {
  return {
    id: randomUUID(),
    type: familyCreated.name,
    version: familyCreated.version,
    occurredAt: new Date().toISOString(),
    traceId: "trace-under-test",
    familyId,
    sourceVersion,
    payload: { name },
  };
}

async function publishCommitted(pool: Pool, input: ReturnType<typeof envelope>): Promise<void> {
  const client = await pool.connect();
  try {
    await client.query("BEGIN");
    await publish(client, familyCreated, input);
    await client.query("COMMIT");
  } finally {
    client.release();
  }
}

async function storedName(
  pool: Pool,
): Promise<{ name: string; source_version: string } | undefined> {
  const client = await pool.connect();
  try {
    await client.query("SELECT set_config('app.family_id', $1, false)", [FAMILY_ID]);
    const { rows } = await client.query<{ name: string; source_version: string }>(
      "SELECT name, source_version FROM family.family_summary WHERE family_id = $1",
      [FAMILY_ID],
    );
    return rows[0];
  } finally {
    client.release();
  }
}

async function projectFamily(event: FamilyCreated, { tx }: HandlerContext): Promise<void> {
  if (event.familyId === null) {
    throw new Error("family projection needs a family");
  }
  await tx.query("SELECT set_config('app.family_id', $1, true)", [event.familyId]);
  const { rows } = await tx.query<{ source_version: string }>(
    "SELECT source_version FROM family.family_summary WHERE family_id = $1",
    [event.familyId],
  );
  const stored = rows[0] ? Number(rows[0].source_version) : null;
  const decision = classifySourceVersion(stored, event.sourceVersion);
  if (decision === "gap") {
    throw new Error("source version gap");
  }
  if (decision !== "apply") {
    return;
  }
  await tx.query(
    `INSERT INTO family.family_summary (family_id, name, source_version)
     VALUES ($1, $2, $3)
     ON CONFLICT (family_id) DO UPDATE
       SET name = EXCLUDED.name, source_version = EXCLUDED.source_version`,
    [event.familyId, event.payload.name, event.sourceVersion],
  );
}

describe("publish", () => {
  let db: TestDatabase;
  let family: Pool;

  beforeAll(async () => {
    db = await startTestDatabase();
    family = db.connect("family");
  }, 120_000);

  afterAll(async () => {
    await db.stop();
  });

  beforeEach(async () => {
    await db.admin.query(
      "TRUNCATE outbox.event, outbox.subscriber_cursor, outbox.dead_letter, family.family_summary RESTART IDENTITY",
    );
  });

  it("commits the event together with the change", async () => {
    await publishCommitted(family, envelope(1, "The Kitchen"));

    const { rows } = await db.admin.query("SELECT count(*)::int AS n FROM outbox.event");
    expect(rows[0]).toEqual({ n: 1 });
  });

  it("drops the event when the change rolls back", async () => {
    const client = await family.connect();
    try {
      await client.query("BEGIN");
      await publish(client, familyCreated, envelope(1, "Rolled back"));
      await client.query("ROLLBACK");
    } finally {
      client.release();
    }

    const { rows } = await db.admin.query("SELECT count(*)::int AS n FROM outbox.event");
    expect(rows[0]).toEqual({ n: 0 });
  });

  it("refuses an event that has no owner", async () => {
    const client = await family.connect();
    try {
      await client.query("BEGIN");
      await expect(publish(client, familyCreated, envelope(1, "Orphan", null))).rejects.toThrow(
        /exactly one owner/,
      );
      await client.query("ROLLBACK");
    } finally {
      client.release();
    }
  });
});

describe("delivery", () => {
  let db: TestDatabase;
  let family: Pool;
  let bus: EventBus;
  let errors: ReturnType<typeof createMemoryErrorSink>;

  beforeAll(async () => {
    db = await startTestDatabase();
    family = db.connect("family");
  }, 120_000);

  afterAll(async () => {
    await db.stop();
  });

  beforeEach(async () => {
    await db.admin.query(
      "TRUNCATE outbox.event, outbox.subscriber_cursor, outbox.dead_letter, family.family_summary RESTART IDENTITY",
    );
    errors = createMemoryErrorSink();
    bus = createEventBus({ errorSink: errors, retryDelayMs: () => 0 });
  });

  it("delivers each event to every subscriber", async () => {
    const first: string[] = [];
    const second: string[] = [];
    bus.subscribe({
      name: "first",
      event: familyCreated,
      pool: family,
      handler: async (event) => {
        first.push(event.payload.name);
      },
    });
    bus.subscribe({
      name: "second",
      event: familyCreated,
      pool: family,
      handler: async (event) => {
        second.push(event.payload.name);
      },
    });
    await publishCommitted(family, envelope(1, "Alpha"));
    await publishCommitted(family, envelope(2, "Beta"));

    await bus.deliverPending();

    expect(first).toEqual(["Alpha", "Beta"]);
    expect(second).toEqual(["Alpha", "Beta"]);
  });

  it("retries a failing handler three times, then dead-letters the event", async () => {
    const handler = vi.fn(async () => {
      throw new Error("projection unavailable");
    });
    bus.subscribe({ name: "flaky", event: familyCreated, pool: family, handler });
    await publishCommitted(family, envelope(1, "Broken"));

    await bus.deliverPending();
    await bus.deliverPending();

    expect(handler).toHaveBeenCalledTimes(3);
    expect(errors.list()).toHaveLength(1);
    const { rows } = await db.admin.query(
      "SELECT subscriber, attempts, error_name FROM outbox.dead_letter",
    );
    expect(rows).toEqual([{ subscriber: "flaky", attempts: 3, error_name: "Error" }]);
  });

  it("keeps the projection on the newest source version", async () => {
    bus.subscribe({
      name: "family-summary",
      event: familyCreated,
      pool: family,
      handler: projectFamily,
    });
    await publishCommitted(family, envelope(1, "Original"));
    await publishCommitted(family, envelope(2, "Renamed"));
    await publishCommitted(family, envelope(1, "Stale replay"));
    await publishCommitted(family, envelope(2, "Duplicate of renamed"));

    await bus.deliverPending();

    expect(await storedName(family)).toEqual({ name: "Renamed", source_version: "2" });
  });

  it("dead-letters an event that arrives ahead of a gap", async () => {
    bus.subscribe({
      name: "family-summary",
      event: familyCreated,
      pool: family,
      handler: projectFamily,
    });
    await publishCommitted(family, envelope(3, "Too early"));

    await bus.deliverPending();

    expect(await storedName(family)).toBeUndefined();
    const { rows } = await db.admin.query("SELECT count(*)::int AS n FROM outbox.dead_letter");
    expect(rows[0]).toEqual({ n: 1 });
  });

  it("rebuilds a projection to the same state by replaying events", async () => {
    const subscription = {
      name: "family-summary",
      event: familyCreated,
      pool: family,
      handler: projectFamily,
    };
    bus.subscribe(subscription);
    await publishCommitted(family, envelope(1, "Original"));
    await publishCommitted(family, envelope(2, "Renamed"));
    await bus.deliverPending();
    const before = await storedName(family);
    expect(before).toEqual({ name: "Renamed", source_version: "2" });

    await db.admin.query("TRUNCATE family.family_summary");
    expect(await storedName(family)).toBeUndefined();
    const replayed = await replayEvents(subscription);

    expect(replayed).toBe(2);
    expect(await storedName(family)).toEqual(before);
  });

  it("hands committed events to an external transport", async () => {
    const sent: FamilyCreated[] = [];
    bus.subscribeTransport({
      name: "broker-adapter",
      event: familyCreated,
      pool: family,
      transport: {
        send: async (event) => {
          sent.push(event);
        },
      },
    });
    await publishCommitted(family, envelope(1, "Forwarded"));

    await bus.deliverPending();

    expect(sent.map((event) => event.payload.name)).toEqual(["Forwarded"]);
  });
});
