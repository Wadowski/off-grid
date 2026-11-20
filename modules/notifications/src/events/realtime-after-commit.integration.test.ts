// SPDX-FileCopyrightText: 2026 Dominik Wadowski
// SPDX-License-Identifier: FSL-1.1-ALv2

import { randomUUID } from "node:crypto";
import { passwordChangedV1 } from "@offgrid/contracts";
import { withUserContext, type ModuleDatabase } from "@offgrid/db";
import { createEventBus, replayEvents, type EventBus, type Subscription } from "@offgrid/event-bus";
import type { Logger } from "@offgrid/observability";
import { createMemoryErrorSink } from "@offgrid/observability";
import { afterAll, beforeAll, beforeEach, describe, expect, it, vi } from "vitest";
import { publishFact } from "../../test/publish-fact.js";
import { startNotificationsTestDatabase } from "../../test/start-notifications-test-database.js";
import type { NotificationsTestDatabase } from "../../test/types.js";
import { createNotificationHub } from "../infrastructure/realtime/create-notification-hub.js";
import { createRealtimeChannel } from "../infrastructure/realtime/create-realtime-channel.js";
import type {
  ListedNotification,
  NoticeSubscriber,
  NotificationChannel,
  NotificationHub,
} from "../types.js";
import { registerFactSubscribers } from "./register-fact-subscribers.js";
import { MAX_NOTIFICATION_STREAMS_PER_USER } from "../constants.js";

const OCCURRED_AT = new Date("2026-05-01T10:00:00.000Z");

const spiedLogger = () => {
  const warn = vi.fn();
  const logger = { debug: vi.fn(), info: vi.fn(), warn, error: vi.fn(), child: vi.fn() };
  return { logger: logger as unknown as Logger, warn };
};

const recordingSubscriber = () => {
  const received: ListedNotification[] = [];
  const subscriber: NoticeSubscriber = {
    send: async (item) => {
      received.push(item);
    },
    close: vi.fn(),
  };
  return { subscriber, received };
};

const passwordChangedSubscription = (subscribe: ReturnType<typeof vi.spyOn>): Subscription => {
  const subscription = subscribe.mock.calls
    .map(([definition]) => definition as Subscription)
    .find((definition) => definition.event.name === passwordChangedV1.name);
  if (subscription === undefined) {
    throw new Error("the password-changed fact subscriber is not registered");
  }
  return subscription;
};

describe("realtime channel after the inbox commit", { timeout: 60_000 }, () => {
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

  const setup = (
    hub: NotificationHub,
    extraChannels: readonly NotificationChannel[],
    logger: Logger,
    database: ModuleDatabase = db.db,
  ) => {
    const bus: EventBus = createEventBus({
      pool: db.pool,
      errorSink: createMemoryErrorSink(),
      retryDelayMs: () => 0,
    });
    const subscribe = vi.spyOn(bus, "subscribe");
    registerFactSubscribers(
      {
        eventBus: bus,
        logger,
        db: database,
        currentUserId: () => null,
      },
      [createRealtimeChannel(hub), ...extraChannels],
    );
    return { bus, subscribe };
  };

  const publishPasswordChanged = async (userId: string): Promise<void> => {
    await db.db.$transaction(async (tx) => {
      await withUserContext(tx, userId);
      await publishFact(tx, passwordChangedV1, userId, OCCURRED_AT);
    });
  };

  const inboxRowsOf = async (userId: string) => {
    const { rows } = await db.admin.query<{ notification_id: string; created_at: Date }>(
      "SELECT notification_id, created_at FROM notifications.notification WHERE user_id = $1",
      [userId],
    );
    return rows;
  };

  it("publishes exactly one list item after the inbox row is committed and visible", async () => {
    const anna = randomUUID();
    const hub = createNotificationHub(spiedLogger().logger, 10, MAX_NOTIFICATION_STREAMS_PER_USER);
    const subscriber = recordingSubscriber();
    hub.subscribe(anna, subscriber.subscriber);
    const rowVisibleWhenDelivered: boolean[] = [];
    const visibilityChannel: NotificationChannel = {
      name: "visibility",
      deliver: async (notice) => {
        const rows = await inboxRowsOf(notice.userId);
        rowVisibleWhenDelivered.push(
          rows.some((row) => row.notification_id === notice.notificationId),
        );
      },
    };
    const { bus } = setup(hub, [visibilityChannel], spiedLogger().logger);

    await publishPasswordChanged(anna);
    await bus.deliverPending();

    const [row] = await inboxRowsOf(anna);
    expect(rowVisibleWhenDelivered).toEqual([true]);
    expect(subscriber.received).toEqual([
      {
        id: row?.notification_id,
        type: "password-changed",
        category: "account-security",
        data: {},
        createdAt: OCCURRED_AT.toISOString(),
        readAt: null,
      },
    ]);
  });

  it("publishes nothing when the change that published the fact rolls back", async () => {
    const anna = randomUUID();
    const hub = createNotificationHub(spiedLogger().logger, 10, MAX_NOTIFICATION_STREAMS_PER_USER);
    const subscriber = recordingSubscriber();
    hub.subscribe(anna, subscriber.subscriber);
    const { bus } = setup(hub, [], spiedLogger().logger);

    await expect(
      db.db.$transaction(async (tx) => {
        await withUserContext(tx, anna);
        await publishFact(tx, passwordChangedV1, anna, OCCURRED_AT);
        throw new Error("change failed");
      }),
    ).rejects.toThrow("change failed");
    await bus.deliverPending();

    expect(subscriber.received).toEqual([]);
    expect(await inboxRowsOf(anna)).toEqual([]);
  });

  it("publishes nothing and fails the handler when the inbox write fails", async () => {
    const anna = randomUUID();
    const hub = createNotificationHub(spiedLogger().logger, 10, MAX_NOTIFICATION_STREAMS_PER_USER);
    const subscriber = recordingSubscriber();
    hub.subscribe(anna, subscriber.subscriber);
    const failingDatabase = {
      $transaction: async () => {
        throw new Error("inbox write failed");
      },
    } as unknown as ModuleDatabase;
    const { subscribe } = setup(hub, [], spiedLogger().logger, failingDatabase);

    const handler = passwordChangedSubscription(subscribe).handler;
    await expect(
      handler({
        id: randomUUID(),
        occurredAt: OCCURRED_AT.toISOString(),
        payload: { userId: anna },
      } as never),
    ).rejects.toThrow("inbox write failed");

    expect(subscriber.received).toEqual([]);
  });

  it("keeps the inbox row and does not fail the subscriber when the hub publish throws", async () => {
    const anna = randomUUID();
    const { logger, warn } = spiedLogger();
    const throwingHub: NotificationHub = {
      subscribe: () => () => undefined,
      publish: () => {
        throw new TypeError("hub broke");
      },
      close: () => undefined,
    };
    const { bus } = setup(throwingHub, [], logger);

    await publishPasswordChanged(anna);
    await bus.deliverPending();

    expect(await inboxRowsOf(anna)).toHaveLength(1);
    expect(warn).toHaveBeenCalledWith("notification channel failed", {
      channel: "realtime",
      error: "TypeError",
    });
    expect(JSON.stringify(warn.mock.calls)).not.toContain(anna);
  });

  it("publishes once when the same fact is redelivered", async () => {
    const anna = randomUUID();
    const hub = createNotificationHub(spiedLogger().logger, 10, MAX_NOTIFICATION_STREAMS_PER_USER);
    const subscriber = recordingSubscriber();
    hub.subscribe(anna, subscriber.subscriber);
    const { bus, subscribe } = setup(hub, [], spiedLogger().logger);

    await publishPasswordChanged(anna);
    await bus.deliverPending();
    expect(subscriber.received).toHaveLength(1);

    expect(await replayEvents(passwordChangedSubscription(subscribe), { pool: db.pool })).toBe(1);

    expect(subscriber.received).toHaveLength(1);
  });
});
