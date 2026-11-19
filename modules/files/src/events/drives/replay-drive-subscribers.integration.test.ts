// SPDX-FileCopyrightText: 2026 Dominik Wadowski
// SPDX-License-Identifier: FSL-1.1-ALv2

import { randomUUID } from "node:crypto";
import { familyCreatedV1, userCreatedV1 } from "@offgrid/contracts";
import { publishOwnedEvent, replayEvents, withTransaction } from "@offgrid/event-bus";
import { afterAll, beforeAll, beforeEach, describe, expect, it } from "vitest";
import { readAllDrives, readDriveCreatedEvents } from "../../../test/drives.js";
import { startFilesTestDatabase } from "../../../test/start-files-test-database.js";
import type { FilesTestDatabase } from "../../../test/types.js";
import { familyDriveSubscription } from "./family-drive-subscription.js";
import { personalDriveSubscription } from "./personal-drive-subscription.js";

describe("drive subscribers replay", { timeout: 60_000 }, () => {
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

  const replayDrives = async () => {
    await replayEvents(personalDriveSubscription(db.db), { pool: db.pool });
    await replayEvents(familyDriveSubscription(db.db), { pool: db.pool });
  };

  it("rebuilds the same drives when the creation events are replayed again", async () => {
    const userId = randomUUID();
    const familyId = randomUUID();
    await withTransaction(db.pool, (client) =>
      publishOwnedEvent(client, userCreatedV1, { userId }, { userId, displayName: "Anna" }),
    );
    await withTransaction(db.pool, (client) =>
      publishOwnedEvent(client, familyCreatedV1, { familyId }, { name: "The Smiths" }),
    );

    await replayDrives();
    const afterFirst = await readAllDrives(db.admin);
    await replayDrives();

    expect(await readAllDrives(db.admin)).toEqual(afterFirst);
    expect(afterFirst).toHaveLength(2);
    expect(await readDriveCreatedEvents(db.admin)).toHaveLength(2);
  });
});
