// SPDX-FileCopyrightText: 2026 Dominik Wadowski
// SPDX-License-Identifier: FSL-1.1-ALv2

import { randomUUID } from "node:crypto";
import { passwordChangedV1, recoveryCodeRegeneratedV1 } from "@offgrid/contracts";
import { withUserContext } from "@offgrid/db";
import { createEventBus } from "@offgrid/event-bus";
import type { Logger } from "@offgrid/observability";
import { createMemoryErrorSink } from "@offgrid/observability";
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
});
