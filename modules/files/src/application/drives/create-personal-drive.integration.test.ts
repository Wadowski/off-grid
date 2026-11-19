// SPDX-FileCopyrightText: 2026 Dominik Wadowski
// SPDX-License-Identifier: FSL-1.1-ALv2

import { randomUUID } from "node:crypto";
import { withUserContext } from "@offgrid/db";
import { afterAll, beforeAll, beforeEach, describe, expect, it } from "vitest";
import { readAllDrives, readDriveCreatedEvents } from "../../../test/drives.js";
import { startFilesTestDatabase } from "../../../test/start-files-test-database.js";
import type { FilesTestDatabase } from "../../../test/types.js";
import { createPersonalDrive } from "./create-personal-drive.js";

describe("createPersonalDrive", { timeout: 60_000 }, () => {
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

  const createFor = (userId: string) => db.db.$transaction((tx) => createPersonalDrive(tx, userId));

  const readAs = <T>(
    userId: string,
    read: (tx: Parameters<Parameters<typeof db.db.$transaction>[0]>[0]) => Promise<T>,
  ) =>
    db.db.$transaction(async (tx) => {
      await withUserContext(tx, userId);
      return read(tx);
    });

  it("creates one personal drive named Personal for a new user", async () => {
    const userId = randomUUID();

    await createFor(userId);

    expect(await readAllDrives(db.admin)).toEqual([
      {
        drive_id: expect.any(String),
        family_id: null,
        user_id: userId,
        kind: "personal",
        name: "Personal",
      },
    ]);
  });

  it("creates no second drive and publishes no second event when called again", async () => {
    const userId = randomUUID();

    await createFor(userId);
    await createFor(userId);

    expect(await readAllDrives(db.admin)).toHaveLength(1);
    expect(await readDriveCreatedEvents(db.admin)).toHaveLength(1);
  });

  it("publishes drive-created-v1 with the drive id and its owner in the same transaction", async () => {
    const userId = randomUUID();

    await createFor(userId);

    const [drive] = await readAllDrives(db.admin);
    const [event] = await readDriveCreatedEvents(db.admin);
    expect(event?.payload).toEqual({
      driveId: drive?.drive_id,
      ownerUserId: userId,
      ownerFamilyId: null,
    });
  });

  it("rolls back the drive and the event together when the transaction fails", async () => {
    const userId = randomUUID();

    await expect(
      db.db.$transaction(async (tx) => {
        await createPersonalDrive(tx, userId);
        throw new Error("rollback");
      }),
    ).rejects.toThrow("rollback");

    expect(await readAllDrives(db.admin)).toEqual([]);
    expect(await readDriveCreatedEvents(db.admin)).toEqual([]);
  });

  it("shows the personal drive only to its owner", async () => {
    const userId = randomUUID();
    const otherUserId = randomUUID();
    await createFor(userId);

    expect(await readAs(userId, (tx) => tx.filesDrive.findMany())).toHaveLength(1);
    expect(await readAs(otherUserId, (tx) => tx.filesDrive.findMany())).toEqual([]);
  });
});
