// SPDX-FileCopyrightText: 2026 Dominik Wadowski
// SPDX-License-Identifier: FSL-1.1-ALv2

import { randomUUID } from "node:crypto";
import { withUserContext } from "@offgrid/db";
import { createEventBus } from "@offgrid/event-bus";
import { createMemoryErrorSink } from "@offgrid/observability";
import { afterAll, beforeAll, beforeEach, describe, expect, it, vi } from "vitest";
import { publishUserNotified } from "../../test/publish-user-notified.js";
import { startNotificationsTestDatabase } from "../../test/start-notifications-test-database.js";
import type { NotificationsTestDatabase } from "../../test/types.js";
import type { Logger } from "@offgrid/observability";
import { registerUserNotifiedSubscriber } from "./register-user-notified-subscriber.js";

const fakeLogger = (): Logger =>
  ({
    debug: vi.fn(),
    info: vi.fn(),
    warn: vi.fn(),
    error: vi.fn(),
    child: vi.fn(),
  }) as unknown as Logger;

describe("user-notified-v1 subscriber", { timeout: 60_000 }, () => {
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
    registerUserNotifiedSubscriber(
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

  it("writes an inbox item when the notice is published", async () => {
    const anna = randomUUID();
    const notificationId = randomUUID();

    await deliverWith(() =>
      db.db.$transaction(async (tx) => {
        await withUserContext(tx, anna);
        await publishUserNotified(
          tx,
          { notificationId, userId: anna, type: "password-changed" },
          new Date(),
        );
      }),
    );

    const { rows } = await db.admin.query<{ notification_id: string }>(
      "SELECT notification_id FROM notifications.notification WHERE user_id = $1",
      [anna],
    );
    expect(rows.map((row) => row.notification_id)).toEqual([notificationId]);
  });

  it("writes no inbox item when the change that raised it rolls back", async () => {
    const anna = randomUUID();

    await expect(
      deliverWith(() =>
        db.db.$transaction(async (tx) => {
          await withUserContext(tx, anna);
          await publishUserNotified(
            tx,
            { notificationId: randomUUID(), userId: anna, type: "password-changed" },
            new Date(),
          );
          throw new Error("change failed");
        }),
      ),
    ).rejects.toThrow("change failed");

    const { rows } = await db.admin.query(
      "SELECT 1 FROM notifications.notification WHERE user_id = $1",
      [anna],
    );
    expect(rows).toEqual([]);
  });
});
