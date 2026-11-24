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
import { emptyDriveTrash } from "./empty-drive-trash.js";

describe("emptyDriveTrash", { timeout: 60_000 }, () => {
  let db: FilesTestDatabase;
  let storage: FileStorage;
  const anna = randomUUID();
  const ben = randomUUID();
  const annaOwner: SeedOwner = { userId: anna, familyId: null };
  const benOwner: SeedOwner = { userId: ben, familyId: null };

  beforeAll(async () => {
    db = await startFilesTestDatabase();
  }, 120_000);

  afterAll(async () => {
    await db.stop();
  }, 120_000);

  beforeEach(async () => {
    await db.reset();
    storage = createInMemoryFileStorage();
  });

  it("purges every trashed row of the drive and leaves live rows", async () => {
    const driveId = await seedDrive(db.admin, { owner: annaOwner, name: "Personal" });
    const otherDriveId = await seedDrive(db.admin, { owner: benOwner, name: "Personal" });
    const folderId = await seedFolder(db.admin, {
      driveId,
      owner: annaOwner,
      parentId: null,
      name: "Old",
      trashed: true,
    });
    await seedRegularFile(db.admin, {
      driveId,
      owner: annaOwner,
      parentId: folderId,
      name: "inner.txt",
      sizeBytes: 1,
      createdByUserId: anna,
      trashed: true,
    });
    const liveId = await seedRegularFile(db.admin, {
      driveId,
      owner: annaOwner,
      parentId: null,
      name: "keep.txt",
      sizeBytes: 1,
      createdByUserId: anna,
    });
    const benTrashId = await seedRegularFile(db.admin, {
      driveId: otherDriveId,
      owner: benOwner,
      parentId: null,
      name: "ben.txt",
      sizeBytes: 1,
      createdByUserId: ben,
      trashed: true,
    });

    const outcome = await emptyDriveTrash(db.db, storage, anna, driveId);

    expect(outcome.outcome).toBe("found");
    const left = await db.admin.query<{ file_id: string }>(
      "SELECT file_id FROM files.file WHERE drive_id = $1",
      [driveId],
    );
    expect(left.rows.map((row) => row.file_id)).toEqual([liveId]);
    const benLeft = await db.admin.query<{ file_id: string }>(
      "SELECT file_id FROM files.file WHERE file_id = $1",
      [benTrashId],
    );
    expect(benLeft.rows).toHaveLength(1);
  });

  it("answers not-found for a drive the caller cannot see", async () => {
    const otherDriveId = await seedDrive(db.admin, { owner: benOwner, name: "Personal" });

    expect((await emptyDriveTrash(db.db, storage, anna, otherDriveId)).outcome).toBe("not-found");
  });
});
