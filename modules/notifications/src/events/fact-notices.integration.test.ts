// SPDX-FileCopyrightText: 2026 Dominik Wadowski
// SPDX-License-Identifier: FSL-1.1-ALv2

import { randomUUID } from "node:crypto";
import {
  calendarEventGuestInvitedV1,
  passwordChangedV1,
  recoveryCodeRegeneratedV1,
} from "@offgrid/contracts";
import { createEventBus, publish, replayEvents } from "@offgrid/event-bus";
import type { Logger } from "@offgrid/observability";
import { createMemoryErrorSink, currentTraceId, resolveTraceId } from "@offgrid/observability";
import { rawSqlExecutor, withUserContext, type ModuleTransaction } from "@offgrid/db";
import { afterAll, beforeAll, beforeEach, describe, expect, it, vi } from "vitest";
import { publishFact } from "../../test/publish-fact.js";
import { startNotificationsTestDatabase } from "../../test/start-notifications-test-database.js";
import type { NotificationsTestDatabase } from "../../test/types.js";
import { registerFactSubscribers } from "./register-fact-subscribers.js";

const fakeLogger = (): Logger =>
  ({
    debug: vi.fn(),
    info: vi.fn(),
    warn: vi.fn(),
    error: vi.fn(),
    child: vi.fn(),
  }) as unknown as Logger;

describe("domain fact subscribers", { timeout: 60_000 }, () => {
  let db: NotificationsTestDatabase;

  beforeAll(async () => {
    db = await startNotificationsTestDatabase();
  }, 120_000);

  afterAll(async () => {
    await db.stop();
  }, 120_000);

  beforeEach(async () => {
    await db.reset();
  });

  const deliverWith = async (publishInTransaction: () => Promise<void>): Promise<void> => {
    const bus = createEventBus({
      pool: db.pool,
      errorSink: createMemoryErrorSink(),
      retryDelayMs: () => 0,
    });
    registerFactSubscribers(
      {
        eventBus: bus,
        logger: fakeLogger(),
        db: db.db,
        currentUserId: () => null,
      },
      [],
    );
    await publishInTransaction();
    await bus.deliverPending();
  };

  const inboxTypesOf = async (userId: string): Promise<string[]> => {
    const { rows } = await db.admin.query<{ type: string }>(
      "SELECT type FROM notifications.notification WHERE user_id = $1 ORDER BY type",
      [userId],
    );
    return rows.map((row) => row.type);
  };

  it("maps a password change fact to a password-changed inbox item", async () => {
    const anna = randomUUID();

    await deliverWith(() =>
      db.db.$transaction(async (tx) => {
        await withUserContext(tx, anna);
        await publishFact(tx, passwordChangedV1, anna, new Date());
      }),
    );

    expect(await inboxTypesOf(anna)).toEqual(["password-changed"]);
  });

  it("maps a recovery code fact to a recovery-code-regenerated inbox item", async () => {
    const anna = randomUUID();

    await deliverWith(() =>
      db.db.$transaction(async (tx) => {
        await withUserContext(tx, anna);
        await publishFact(tx, recoveryCodeRegeneratedV1, anna, new Date());
      }),
    );

    expect(await inboxTypesOf(anna)).toEqual(["recovery-code-regenerated"]);
  });

  it("writes no inbox item when the change that published the fact rolls back", async () => {
    const anna = randomUUID();

    await expect(
      deliverWith(() =>
        db.db.$transaction(async (tx) => {
          await withUserContext(tx, anna);
          await publishFact(tx, passwordChangedV1, anna, new Date());
          throw new Error("change failed");
        }),
      ),
    ).rejects.toThrow("change failed");

    expect(await inboxTypesOf(anna)).toEqual([]);
  });

  const inviteFact = async (tx: ModuleTransaction, host: string, guest: string) => {
    const eventId = randomUUID();
    await publish(
      rawSqlExecutor(tx),
      calendarEventGuestInvitedV1,
      {
        id: randomUUID(),
        type: calendarEventGuestInvitedV1.name,
        version: calendarEventGuestInvitedV1.version,
        occurredAt: new Date().toISOString(),
        traceId: resolveTraceId(currentTraceId()),
        familyId: null,
        sourceVersion: 1,
        payload: { eventId, guestUserId: guest, calendarId: randomUUID() },
      },
      { userId: host },
    );
    return eventId;
  };

  const inboxRowsOf = async (userId: string) => {
    const { rows } = await db.admin.query<{ type: string; data: Record<string, string> }>(
      "SELECT type, data FROM notifications.notification WHERE user_id = $1",
      [userId],
    );
    return rows;
  };

  it("maps an invite fact to one event-invited item for the guest, carrying the event id", async () => {
    const host = randomUUID();
    const guest = randomUUID();
    let eventId = "";

    await deliverWith(() =>
      db.db.$transaction(async (tx) => {
        await withUserContext(tx, host);
        eventId = await inviteFact(tx, host, guest);
      }),
    );

    expect(await inboxRowsOf(guest)).toEqual([
      expect.objectContaining({ type: "event-invited", data: { eventId } }),
    ]);
    expect(await inboxRowsOf(host)).toEqual([]);
  });

  it("writes no invite item when the invite that published the fact rolls back", async () => {
    const host = randomUUID();
    const guest = randomUUID();

    await expect(
      deliverWith(() =>
        db.db.$transaction(async (tx) => {
          await withUserContext(tx, host);
          await inviteFact(tx, host, guest);
          throw new Error("invite failed");
        }),
      ),
    ).rejects.toThrow("invite failed");

    expect(await inboxRowsOf(guest)).toEqual([]);
  });

  it("writes no second invite item when the same invite fact is redelivered", async () => {
    const host = randomUUID();
    const guest = randomUUID();
    const bus = createEventBus({
      pool: db.pool,
      errorSink: createMemoryErrorSink(),
      retryDelayMs: () => 0,
    });
    const subscribe = vi.spyOn(bus, "subscribe");
    registerFactSubscribers(
      {
        eventBus: bus,
        logger: fakeLogger(),
        db: db.db,
        currentUserId: () => null,
      },
      [],
    );
    const inviteSubscription = subscribe.mock.calls
      .map(([subscription]) => subscription)
      .find((subscription) => subscription.event.name === calendarEventGuestInvitedV1.name);
    if (inviteSubscription === undefined) {
      throw new Error("the invite fact subscriber is not registered");
    }

    await db.db.$transaction(async (tx) => {
      await withUserContext(tx, host);
      await inviteFact(tx, host, guest);
    });
    await bus.deliverPending();
    const firstDelivery = await inboxRowsOf(guest);
    expect(firstDelivery).toHaveLength(1);

    expect(await replayEvents(inviteSubscription, { pool: db.pool })).toBe(1);

    expect(await inboxRowsOf(guest)).toEqual(firstDelivery);
  });
});
