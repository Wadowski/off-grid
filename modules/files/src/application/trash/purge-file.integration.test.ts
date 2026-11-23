// SPDX-FileCopyrightText: 2026 Dominik Wadowski
// SPDX-License-Identifier: FSL-1.1-ALv2

import { randomUUID } from "node:crypto";
import { createInMemoryFileStorage, type FileStorage } from "@offgrid/file-storage";
import { afterAll, beforeAll, beforeEach, describe, expect, it } from "vitest";
import { seedDrive } from "../../../test/seed-drive.js";
import { seedFolder } from "../../../test/seed-folder.js";
import { seedRegularFile } from "../../../test/seed-regular-file.js";
import { startFilesTestDatabase } from "../../../test/start-files-test-database.js";
import type { FilesTestDatabase, SeedOwner } from "../../../test/types.js";
import { purgeFile } from "./purge-file.js";
import { trashFile } from "./trash-file.js";
import { NotTrashedError } from "../errors/not-trashed-error.js";

describe("purgeFile", { timeout: 60_000 }, () => {
  let db: FilesTestDatabase;
  let storage: FileStorage;
  const anna = randomUUID();
  const ben = randomUUID();
  const chris = randomUUID();
  const familyId = randomUUID();
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
    storage = createInMemoryFileStorage();
    await db.admin.query(
      "INSERT INTO files.family_membership (family_id, user_id, source_version, is_member) VALUES ($1, $2, 1, true), ($1, $3, 1, false)",
      [familyId, ben, chris],
    );
  });

  it("removes a trashed folder, its subtree, versions and bytes, with one removed event per row", async () => {
    const driveId = await seedDrive(db.admin, { owner: annaOwner, name: "Personal" });
    const folderId = await seedFolder(db.admin, {
      driveId,
      owner: annaOwner,
      parentId: null,
      name: "Holiday",
    });
    const childId = await seedRegularFile(db.admin, {
      driveId,
      owner: annaOwner,
      parentId: folderId,
      name: "sunset.jpg",
      sizeBytes: 3,
      createdByUserId: anna,
      storageKey: "purge-key",
    });
    await trashFile(db.db, anna, folderId);

    const outcome = await purgeFile(db.db, storage, anna, folderId);

    expect(outcome.outcome).toBe("found");
    const remaining = await db.admin.query("SELECT file_id FROM files.file WHERE drive_id = $1", [
      driveId,
    ]);
    expect(remaining.rows).toEqual([]);
    const versions = await db.admin.query(
      "SELECT version_id FROM files.file_version WHERE file_id = $1",
      [childId],
    );
    expect(versions.rows).toEqual([]);
    const removed = await db.admin.query<{
      source_version: string;
      payload: { fileId: string; version: number };
    }>(
      "SELECT source_version, payload FROM outbox.event WHERE type = 'file-removed-v1' AND payload->>'driveId' = $1 ORDER BY sequence",
      [driveId],
    );
    expect(removed.rows.map((row) => row.payload.fileId).sort()).toEqual(
      [folderId, childId].sort(),
    );
    expect(removed.rows.map((row) => Number(row.source_version))).toEqual([2, 3]);
  });

  it("answers NOT_TRASHED for a live file", async () => {
    const driveId = await seedDrive(db.admin, { owner: annaOwner, name: "Personal" });
    const fileId = await seedRegularFile(db.admin, {
      driveId,
      owner: annaOwner,
      parentId: null,
      name: "a.txt",
      sizeBytes: 1,
      createdByUserId: anna,
    });

    await expect(purgeFile(db.db, storage, anna, fileId)).rejects.toBeInstanceOf(NotTrashedError);
  });

  it("answers not-found for a trashed row hidden by a trashed ancestor, and for a non-member", async () => {
    const driveId = await seedDrive(db.admin, { owner: familyOwner, name: "The Smiths" });
    const folderId = await seedFolder(db.admin, {
      driveId,
      owner: familyOwner,
      parentId: null,
      name: "Shared",
      trashed: true,
    });
    const childId = await seedRegularFile(db.admin, {
      driveId,
      owner: familyOwner,
      parentId: folderId,
      name: "a.txt",
      sizeBytes: 1,
      createdByUserId: ben,
      trashed: true,
    });

    expect((await purgeFile(db.db, storage, anna, childId)).outcome).toBe("not-found");
    expect((await purgeFile(db.db, storage, chris, folderId)).outcome).toBe("not-found");
  });

  it("lets a family member purge a trashed family folder", async () => {
    const driveId = await seedDrive(db.admin, { owner: familyOwner, name: "The Smiths" });
    const folderId = await seedFolder(db.admin, {
      driveId,
      owner: familyOwner,
      parentId: null,
      name: "Shared",
      trashed: true,
    });

    expect((await purgeFile(db.db, storage, ben, folderId)).outcome).toBe("found");
  });
});
