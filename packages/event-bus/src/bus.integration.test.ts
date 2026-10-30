// SPDX-FileCopyrightText: 2026 Dominik Wadowski
// SPDX-License-Identifier: FSL-1.1-ALv2

import { randomUUID } from "node:crypto";
import { createMemoryErrorSink } from "@offgrid/observability";
import type { Pool } from "pg";
import { afterAll, beforeAll, beforeEach, describe, expect, it, vi } from "vitest";
import {
  classifySourceVersion,
  createEventBus,
  publish,
  replayEvents,
  type EventBus,
  type HandlerContext,
} from "./index.js";
import { familyCreated } from "../test/family-created.js";
import { startTestDatabase } from "../test/start-test-database.js";
import { waitFor } from "../test/wait-for.js";
import type { FamilyCreated, TestDatabase } from "../test/types.js";

const FAMILY_ID = randomUUID();

const RESET_TABLES =
  "TRUNCATE outbox.event, outbox.subscriber_cursor, outbox.dead_letter, family.family_summary RESTART IDENTITY";

const envelope = (sourceVersion: number, name: string, familyId: string | null = FAMILY_ID) => {
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
};

const publishCommitted = async (pool: Pool, input: ReturnType<typeof envelope>): Promise<void> => {
  const client = await pool.connect();
  try {
    await client.query("BEGIN");
    await publish(client, familyCreated, input);
    await client.query("COMMIT");
  } finally {
    client.release();
  }
};

const storedName = async (
  pool: Pool,
): Promise<{ name: string; source_version: string } | undefined> => {
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
};

const projectFamily = async (event: FamilyCreated, { tx }: HandlerContext): Promise<void> => {
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
};

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
    await db.admin.query(RESET_TABLES);
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

  it("does not let a module read the event stream", async () => {
    await expect(family.query("SELECT * FROM outbox.events_after(0, NULL, 10)")).rejects.toThrow(
      /permission denied/,
    );
  });
});

describe("delivery", () => {
  let db: TestDatabase;
  let family: Pool;
  let outbox: Pool;
  let bus: EventBus;
  let errors: ReturnType<typeof createMemoryErrorSink>;

  beforeAll(async () => {
    db = await startTestDatabase();
    family = db.connect("family");
    outbox = db.connect("outbox");
  }, 120_000);

  afterAll(async () => {
    await db.stop();
  });

  beforeEach(async () => {
    await db.admin.query(RESET_TABLES);
    errors = createMemoryErrorSink();
    bus = createEventBus({
      pool: outbox,
      poolForRole: db.connect,
      errorSink: errors,
      retryDelayMs: () => 0,
    });
  });

  it("delivers each event to every subscriber", async () => {
    const first: string[] = [];
    const second: string[] = [];
    bus.subscribe({
      name: "first",
      event: familyCreated,
      runAs: "family",
      handler: async (event) => {
        first.push(event.payload.name);
      },
    });
    bus.subscribe({
      name: "second",
      event: familyCreated,
      runAs: "family",
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

  it("runs a handler as its module role", async () => {
    const roles: string[] = [];
    bus.subscribe({
      name: "role-check",
      event: familyCreated,
      runAs: "family",
      handler: async (_event, { tx }) => {
        const { rows } = await tx.query<{ role: string }>("SELECT current_user AS role");
        roles.push(rows[0]?.role ?? "");
      },
    });
    await publishCommitted(family, envelope(1, "Role"));

    await bus.deliverPending();

    expect(roles).toEqual(["family_app"]);
  });

  it("does not let a handler read the event stream or switch to the bus role", async () => {
    const refusals: string[] = [];
    bus.subscribe({
      name: "escape-check",
      event: familyCreated,
      runAs: "family",
      handler: async (_event, { tx }) => {
        for (const probe of [
          "SELECT * FROM outbox.events_after(0, NULL, 10)",
          "SET ROLE outbox_app",
        ]) {
          await tx.query("SAVEPOINT probe");
          await tx.query(probe).catch(async (error: Error) => {
            refusals.push(error.message);
            await tx.query("ROLLBACK TO SAVEPOINT probe");
          });
        }
      },
    });
    await publishCommitted(family, envelope(1, "Escape"));

    await bus.deliverPending();

    expect(refusals).toEqual([
      expect.stringMatching(/permission denied/),
      expect.stringMatching(/permission denied/),
    ]);
  });

  it("refuses to subscribe or replay a handler as the bus role", async () => {
    const handler = async () => undefined;
    expect(() =>
      bus.subscribe({ name: "as-bus", event: familyCreated, runAs: "outbox", handler }),
    ).toThrow(/invalid module name/);
    await expect(
      replayEvents(
        { event: familyCreated, runAs: "outbox", handler },
        {
          pool: outbox,
          poolForRole: db.connect,
        },
      ),
    ).rejects.toThrow(/invalid module name/);
  });

  it("retries a failing handler three times, then dead-letters the event", async () => {
    const handler = vi.fn(async () => {
      throw new Error("projection unavailable");
    });
    bus.subscribe({ name: "flaky", event: familyCreated, runAs: "family", handler });
    await publishCommitted(family, envelope(1, "Broken"));

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
      runAs: "family",
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
      runAs: "family",
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
      runAs: "family",
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
    const replayed = await replayEvents(subscription, { pool: outbox, poolForRole: db.connect });

    expect(replayed).toBe(2);
    expect(await storedName(family)).toEqual(before);
  });

  it("hands committed events to an external transport", async () => {
    const sent: FamilyCreated[] = [];
    bus.subscribeTransport({
      name: "broker-adapter",
      event: familyCreated,
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

  it("delivers in the background until stopped, woken by notifications", async () => {
    const listener = await db.connectClient("outbox");
    const loopBus = createEventBus({
      pool: outbox,
      poolForRole: db.connect,
      listener,
      errorSink: errors,
      pollIntervalMs: 50,
    });
    const names: string[] = [];
    loopBus.subscribe({
      name: "background",
      event: familyCreated,
      runAs: "family",
      handler: async (event) => {
        names.push(event.payload.name);
      },
    });
    await loopBus.start();
    try {
      await publishCommitted(family, envelope(1, "Live"));

      await waitFor(() => names.includes("Live"));
    } finally {
      await loopBus.stop();
    }

    expect(names).toEqual(["Live"]);
  });

  it("stays stopped when the notification listener cannot start", async () => {
    const listener = await db.connectClient("outbox");
    await listener.end();
    const loopBus = createEventBus({
      pool: outbox,
      poolForRole: db.connect,
      listener,
      errorSink: errors,
    });

    await expect(loopBus.start()).rejects.toThrow();
    await expect(loopBus.stop()).resolves.toBeUndefined();
  });

  it("prunes only events that every subscriber has passed", async () => {
    bus.subscribe({
      name: "first",
      event: familyCreated,
      runAs: "family",
      handler: async () => undefined,
    });
    await publishCommitted(family, envelope(1, "Kept until everyone reads"));
    await publishCommitted(family, envelope(2, "Also kept"));
    await outbox.query("SELECT outbox.lock_cursor('lagging')");
    await bus.deliverPending();

    expect(await bus.prune(0)).toBe(0);

    await db.admin.query("DELETE FROM outbox.subscriber_cursor WHERE subscriber = 'lagging'");
    expect(await bus.prune(0)).toBe(2);
    const { rows } = await db.admin.query("SELECT count(*)::int AS n FROM outbox.event");
    expect(rows[0]).toEqual({ n: 0 });
  });
});
