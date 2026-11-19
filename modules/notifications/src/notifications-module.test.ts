// SPDX-FileCopyrightText: 2026 Dominik Wadowski
// SPDX-License-Identifier: FSL-1.1-ALv2

import { passwordChangedV1 } from "@offgrid/contracts";
import type { ModuleDatabase } from "@offgrid/db";
import type { EventBus } from "@offgrid/event-bus";
import type { Logger } from "@offgrid/observability";
import { describe, expect, it, vi } from "vitest";
import { REALTIME_WORKER_NAME } from "./constants.js";
import { createNotificationsModule } from "./notifications-module.js";
import type { NotificationChannel } from "./types.js";

const USER = "5a6b7c8d-9e0f-4a1b-8c2d-3e4f5a6b7c8d";
const FACT_ID = "3f1c6a7e-7d0f-4c1e-9b8a-2f5d6e7a8b9c";
const OCCURRED_AT = "2026-05-01T10:00:00.000Z";

const fakeLogger = () => ({
  debug: vi.fn(),
  info: vi.fn(),
  warn: vi.fn(),
  error: vi.fn(),
  child: vi.fn(),
});

const fakeTransactionalDb = (insertedCount: number, steps: string[]) => {
  const tx = {
    $executeRawUnsafe: vi.fn(async () => {
      steps.push("set-user-context");
    }),
    notificationItem: {
      createMany: vi.fn(async () => {
        steps.push("insert");
        return { count: insertedCount };
      }),
    },
  };
  return { $transaction: async (callback: (client: typeof tx) => unknown) => callback(tx) };
};

const recordingChannel = (steps: string[]) => {
  const deliver = vi.fn(async () => {
    steps.push("deliver");
  });
  const channel: NotificationChannel = { name: "recording", deliver };
  return { channel, deliver };
};

const passwordChangedHandler = (subscribe: ReturnType<typeof vi.fn>) => {
  const subscription = subscribe.mock.calls
    .map(([definition]) => definition)
    .find((definition) => definition.event.name === passwordChangedV1.name);
  if (subscription === undefined) {
    throw new Error("the password-changed fact subscriber is not registered");
  }
  return subscription.handler as (received: unknown) => Promise<void>;
};

const passwordChangedFact = {
  id: FACT_ID,
  occurredAt: OCCURRED_AT,
  payload: { userId: USER },
};

const registeredHandler = (db: unknown, channels: readonly NotificationChannel[]) => {
  const subscribe = vi.fn();
  const context = {
    eventBus: { subscribe } as unknown as EventBus,
    logger: fakeLogger() as unknown as Logger,
    db: db as ModuleDatabase,
    currentUserId: () => null,
  };
  createNotificationsModule({ channels }).registerSubscribers(context);
  return passwordChangedHandler(subscribe);
};

describe("createNotificationsModule", () => {
  it("provides one realtime worker", () => {
    const logger = { debug: vi.fn(), info: vi.fn(), warn: vi.fn(), error: vi.fn(), child: vi.fn() };
    const workers = createNotificationsModule().workers({ logger: logger as unknown as Logger });

    expect(workers.map((worker) => worker.name)).toEqual([REALTIME_WORKER_NAME]);
  });

  it("delivers a fact to the configured channels only after its inbox row is written", async () => {
    const steps: string[] = [];
    const { channel, deliver } = recordingChannel(steps);
    const handler = registeredHandler(fakeTransactionalDb(1, steps), [channel]);

    await handler(passwordChangedFact);

    expect(steps).toEqual(["set-user-context", "insert", "deliver"]);
    expect(deliver).toHaveBeenCalledWith({
      notificationId: FACT_ID,
      userId: USER,
      type: "password-changed",
      data: {},
      createdAt: new Date(OCCURRED_AT),
    });
  });

  it("does not deliver a fact whose inbox row already existed", async () => {
    const steps: string[] = [];
    const { channel, deliver } = recordingChannel(steps);
    const handler = registeredHandler(fakeTransactionalDb(0, steps), [channel]);

    await handler(passwordChangedFact);

    expect(deliver).not.toHaveBeenCalled();
  });
});
