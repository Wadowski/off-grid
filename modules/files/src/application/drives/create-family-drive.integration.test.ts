// SPDX-FileCopyrightText: 2026 Dominik Wadowski
// SPDX-License-Identifier: FSL-1.1-ALv2

import { randomUUID } from "node:crypto";
import { withUserContext } from "@offgrid/db";
import { afterAll, beforeAll, beforeEach, describe, expect, it } from "vitest";
import { readAllDrives, readDriveCreatedEvents } from "../../../test/drives.js";
import { startFilesTestDatabase } from "../../../test/start-files-test-database.js";
import type { FilesTestDatabase } from "../../../test/types.js";
import { createFamilyDrive } from "./create-family-drive.js";

describe("createFamilyDrive", { timeout: 60_000 }, () => {
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

  const createFor = (familyId: string, name: string) =>
    db.db.$transaction((tx) => createFamilyDrive(tx, familyId, name));

  const readAs = <T>(
    userId: string,
    read: (tx: Parameters<Parameters<typeof db.db.$transaction>[0]>[0]) => Promise<T>,
  ) =>
    db.db.$transaction(async (tx) => {
      await withUserContext(tx, userId);
      return read(tx);
    });

  const seedMembership = (familyId: string, userId: string) =>
    db.admin.query(
      "INSERT INTO files.family_membership (family_id, user_id, source_version, is_member) VALUES ($1, $2, 1, true)",
      [familyId, userId],
    );

  it("creates one family drive named after the family", async () => {
    const familyId = randomUUID();

    await createFor(familyId, "The Smiths");

    expect(await readAllDrives(db.admin)).toEqual([
      {
        drive_id: expect.any(String),
        family_id: familyId,
        user_id: null,
        kind: "family",
        name: "The Smiths",
      },
    ]);
  });

  it("creates no second drive and publishes no second event when called again", async () => {
    const familyId = randomUUID();

    await createFor(familyId, "The Smiths");
    await createFor(familyId, "The Smiths");

    expect(await readAllDrives(db.admin)).toHaveLength(1);
    expect(await readDriveCreatedEvents(db.admin)).toHaveLength(1);
  });

  it("publishes drive-created-v1 with the drive id and its family in the same transaction", async () => {
    const familyId = randomUUID();

    await createFor(familyId, "The Smiths");

    const [drive] = await readAllDrives(db.admin);
    const [event] = await readDriveCreatedEvents(db.admin);
    expect(event?.payload).toEqual({
      driveId: drive?.drive_id,
      ownerUserId: null,
      ownerFamilyId: familyId,
    });
  });

  it("rolls back the drive and the event together when the transaction fails", async () => {
    const familyId = randomUUID();

    await expect(
      db.db.$transaction(async (tx) => {
        await createFamilyDrive(tx, familyId, "The Smiths");
        throw new Error("rollback");
      }),
    ).rejects.toThrow("rollback");

    expect(await readAllDrives(db.admin)).toEqual([]);
    expect(await readDriveCreatedEvents(db.admin)).toEqual([]);
  });

  it("shows the family drive to its members only", async () => {
    const familyId = randomUUID();
    const member = randomUUID();
    const nonMember = randomUUID();
    await seedMembership(familyId, member);
    await createFor(familyId, "The Smiths");

    expect(await readAs(member, (tx) => tx.filesDrive.findMany())).toHaveLength(1);
    expect(await readAs(nonMember, (tx) => tx.filesDrive.findMany())).toEqual([]);
  });
});
