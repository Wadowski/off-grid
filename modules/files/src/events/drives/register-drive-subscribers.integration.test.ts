// SPDX-FileCopyrightText: 2026 Dominik Wadowski
// SPDX-License-Identifier: FSL-1.1-ALv2

import { randomUUID } from "node:crypto";
import { familyCreatedV1, userCreatedV1 } from "@offgrid/contracts";
import { createEventBus, publishOwnedEvent, withTransaction } from "@offgrid/event-bus";
import { createMemoryErrorSink } from "@offgrid/observability";
import { afterAll, beforeAll, beforeEach, describe, expect, it } from "vitest";
import { readAllDrives, readDriveCreatedEvents } from "../../../test/drives.js";
import { startFilesTestDatabase } from "../../../test/start-files-test-database.js";
import type { FilesTestDatabase } from "../../../test/types.js";
import { registerDriveSubscribers } from "./register-drive-subscribers.js";

describe("drive subscribers", { timeout: 60_000 }, () => {
  let db: FilesTestDatabase;

  beforeAll(async () => {
    db = await startFilesTestDatabase();
  }, 120_000);

  afterAll(async () => {
    await db.stop();
  }, 120_000);

  beforeEach(async () => {
    await db.reset();
    await db.admin.query("TRUNCATE outbox.event, outbox.subscriber_cursor, outbox.dead_letter");
  });

  const publishUserCreated = (userId: string) =>
    withTransaction(db.pool, (client) =>
      publishOwnedEvent(client, userCreatedV1, { userId }, { userId, displayName: "Anna" }),
    );

  const publishFamilyCreated = (familyId: string) =>
    withTransaction(db.pool, (client) =>
      publishOwnedEvent(client, familyCreatedV1, { familyId }, { name: "The Smiths" }),
    );

  const createBus = () =>
    createEventBus({
      pool: db.pool,
      errorSink: createMemoryErrorSink(),
      retryDelayMs: () => 0,
    });

  it("creates one personal and one family drive when each event is delivered twice", async () => {
    const userId = randomUUID();
    const familyId = randomUUID();
    await publishUserCreated(userId);
    await publishUserCreated(userId);
    await publishFamilyCreated(familyId);
    await publishFamilyCreated(familyId);
    const bus = createBus();
    registerDriveSubscribers({ eventBus: bus, db: db.db });

    await bus.deliverPending();

    expect(await readAllDrives(db.admin)).toEqual([
      {
        drive_id: expect.any(String),
        family_id: null,
        user_id: userId,
        kind: "personal",
        name: "Personal",
      },
      {
        drive_id: expect.any(String),
        family_id: familyId,
        user_id: null,
        kind: "family",
        name: "The Smiths",
      },
    ]);
    expect(await readDriveCreatedEvents(db.admin)).toHaveLength(2);
  });

  it("creates each drive once when the events arrive one at a time", async () => {
    const userId = randomUUID();
    const bus = createBus();
    registerDriveSubscribers({ eventBus: bus, db: db.db });

    await publishUserCreated(userId);
    await bus.deliverPending();
    await publishUserCreated(userId);
    await bus.deliverPending();

    expect(await readAllDrives(db.admin)).toHaveLength(1);
    expect(await readDriveCreatedEvents(db.admin)).toHaveLength(1);
  });
});
