// SPDX-FileCopyrightText: 2026 Dominik Wadowski
// SPDX-License-Identifier: FSL-1.1-ALv2

import { randomUUID } from "node:crypto";
import { createInMemoryFileStorage } from "@offgrid/file-storage";
import { afterAll, beforeAll, beforeEach, describe, expect, it } from "vitest";
import { startFilesTestDatabase } from "../../../test/start-files-test-database.js";
import { seedDrive } from "../../../test/seed-drive.js";
import { seedFolder } from "../../../test/seed-folder.js";
import { seedRegularFile } from "../../../test/seed-regular-file.js";
import type { FilesTestDatabase, SeedOwner } from "../../../test/types.js";
import { InvalidMoveError } from "../errors/invalid-move-error.js";
import { NameTakenError } from "../errors/name-taken-error.js";
import { moveFile } from "./move-file.js";

describe("moveFile within a drive", { timeout: 60_000 }, () => {
  let db: FilesTestDatabase;
  const storage = createInMemoryFileStorage();
  const familyId = randomUUID();
  const anna = randomUUID();
  const ben = randomUUID();
  const annaOwner: SeedOwner = { userId: anna, familyId: null };
  const familyOwner: SeedOwner = { userId: null, familyId };

  beforeAll(async () => {
    db = await startFilesTestDatabase();
  }, 120_000);

  afterAll(async () => {
    await db.stop();
  }, 120_000);

  beforeEach(async () => {
    await db.reset();
    await db.admin.query("TRUNCATE outbox.event, outbox.subscriber_cursor, outbox.dead_letter");
    await db.admin.query(
      "INSERT INTO files.family_membership (family_id, user_id, source_version, is_member) VALUES ($1, $2, 1, true)",
      [familyId, anna],
    );
  });

  const parentOf = async (fileId: string) => {
    const { rows } = await db.admin.query<{ parent_id: string | null; version: number }>(
      "SELECT parent_id, version FROM files.file WHERE file_id = $1",
      [fileId],
    );
    return rows[0];
  };

  const updatedEventCount = async () => {
    const { rows } = await db.admin.query<{ count: string }>(
      "SELECT count(*) FROM outbox.event WHERE type = 'file-updated-v1'",
    );
    return Number(rows[0]?.count);
  };

  it("moves a folder into another folder, bumps its version and publishes one updated event", async () => {
    const driveId = await seedDrive(db.admin, { owner: annaOwner, name: "Personal" });
    const holiday = await seedFolder(db.admin, {
      driveId,
      owner: annaOwner,
      parentId: null,
      name: "Holiday",
    });
    const photos = await seedFolder(db.admin, {
      driveId,
      owner: annaOwner,
      parentId: null,
      name: "Photos",
    });

    const result = await moveFile(db.db, storage, anna, holiday, { driveId, parentId: photos });

    expect(result.outcome === "found" && result.value.crossOwnerNotice).toBe(false);
    expect(await parentOf(holiday)).toEqual({ parent_id: photos, version: 2 });
    expect(await updatedEventCount()).toBe(1);
  });

  it("moves a folder to the drive root", async () => {
    const driveId = await seedDrive(db.admin, { owner: annaOwner, name: "Personal" });
    const photos = await seedFolder(db.admin, {
      driveId,
      owner: annaOwner,
      parentId: null,
      name: "Photos",
    });
    const holiday = await seedFolder(db.admin, {
      driveId,
      owner: annaOwner,
      parentId: photos,
      name: "Holiday",
    });

    await moveFile(db.db, storage, anna, holiday, { driveId, parentId: null });

    expect(await parentOf(holiday)).toEqual({ parent_id: null, version: 2 });
  });

  it("changes nothing when the folder is already in the target folder", async () => {
    const driveId = await seedDrive(db.admin, { owner: annaOwner, name: "Personal" });
    const holiday = await seedFolder(db.admin, {
      driveId,
      owner: annaOwner,
      parentId: null,
      name: "Holiday",
    });

    const result = await moveFile(db.db, storage, anna, holiday, { driveId, parentId: null });

    expect(result.outcome).toBe("found");
    expect(await parentOf(holiday)).toEqual({ parent_id: null, version: 1 });
    expect(await updatedEventCount()).toBe(0);
  });

  it("refuses a move into itself or into one of its descendants, and changes nothing", async () => {
    const driveId = await seedDrive(db.admin, { owner: annaOwner, name: "Personal" });
    const holiday = await seedFolder(db.admin, {
      driveId,
      owner: annaOwner,
      parentId: null,
      name: "Holiday",
    });
    const beach = await seedFolder(db.admin, {
      driveId,
      owner: annaOwner,
      parentId: holiday,
      name: "Beach",
    });
    const day = await seedFolder(db.admin, {
      driveId,
      owner: annaOwner,
      parentId: beach,
      name: "Day",
    });

    await expect(
      moveFile(db.db, storage, anna, holiday, { driveId, parentId: holiday }),
    ).rejects.toBeInstanceOf(InvalidMoveError);
    await expect(
      moveFile(db.db, storage, anna, holiday, { driveId, parentId: beach }),
    ).rejects.toBeInstanceOf(InvalidMoveError);
    await expect(
      moveFile(db.db, storage, anna, holiday, { driveId, parentId: day }),
    ).rejects.toBeInstanceOf(InvalidMoveError);
    expect(await parentOf(holiday)).toEqual({ parent_id: null, version: 1 });
    expect(await updatedEventCount()).toBe(0);
  });

  it("refuses a name already used in the target folder, ignoring case", async () => {
    const driveId = await seedDrive(db.admin, { owner: annaOwner, name: "Personal" });
    const holiday = await seedFolder(db.admin, {
      driveId,
      owner: annaOwner,
      parentId: null,
      name: "Holiday",
    });
    const photos = await seedFolder(db.admin, {
      driveId,
      owner: annaOwner,
      parentId: null,
      name: "Photos",
    });
    await seedFolder(db.admin, { driveId, owner: annaOwner, parentId: photos, name: "HOLIDAY" });

    await expect(
      moveFile(db.db, storage, anna, holiday, { driveId, parentId: photos }),
    ).rejects.toBeInstanceOf(NameTakenError);
    expect(await parentOf(holiday)).toEqual({ parent_id: null, version: 1 });
  });

  it("answers not-found for a target that is a regular file, trashed, or missing", async () => {
    const driveId = await seedDrive(db.admin, { owner: annaOwner, name: "Personal" });
    const holiday = await seedFolder(db.admin, {
      driveId,
      owner: annaOwner,
      parentId: null,
      name: "Holiday",
    });
    const file = await seedRegularFile(db.admin, {
      driveId,
      owner: annaOwner,
      parentId: null,
      name: "notes.txt",
      sizeBytes: 3,
      createdByUserId: anna,
    });
    const trashed = await seedFolder(db.admin, {
      driveId,
      owner: annaOwner,
      parentId: null,
      name: "Old",
      trashed: true,
    });

    expect(await moveFile(db.db, storage, anna, holiday, { driveId, parentId: file })).toEqual({
      outcome: "not-found",
    });
    expect(await moveFile(db.db, storage, anna, holiday, { driveId, parentId: trashed })).toEqual({
      outcome: "not-found",
    });
    expect(
      await moveFile(db.db, storage, anna, holiday, { driveId, parentId: randomUUID() }),
    ).toEqual({
      outcome: "not-found",
    });
    expect(await parentOf(holiday)).toEqual({ parent_id: null, version: 1 });
  });

  it("answers not-found when a non-member asks to move in the family drive", async () => {
    const driveId = await seedDrive(db.admin, { owner: familyOwner, name: "The Smiths" });
    const holiday = await seedFolder(db.admin, {
      driveId,
      owner: familyOwner,
      parentId: null,
      name: "Holiday",
    });
    const photos = await seedFolder(db.admin, {
      driveId,
      owner: familyOwner,
      parentId: null,
      name: "Photos",
    });

    expect(await moveFile(db.db, storage, ben, holiday, { driveId, parentId: photos })).toEqual({
      outcome: "not-found",
    });
    expect(await updatedEventCount()).toBe(0);
  });
});
