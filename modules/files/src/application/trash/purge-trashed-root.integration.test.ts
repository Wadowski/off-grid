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
import { restoreTrashedFile } from "../../infrastructure/trash/restore-trashed-file.js";
import { writeAsUser } from "../write-as-user.js";
import { purgeTrashedRoot } from "./purge-trashed-root.js";

const pause = (milliseconds: number): Promise<void> =>
  new Promise((resolve) => setTimeout(resolve, milliseconds));

describe("purgeTrashedRoot", { timeout: 60_000 }, () => {
  let db: FilesTestDatabase;
  let storage: FileStorage;
  const anna = randomUUID();
  const annaOwner: SeedOwner = { userId: anna, familyId: null };

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

  it("keeps a trashed child that is restored while the purge of its folder runs", async () => {
    const driveId = await seedDrive(db.admin, { owner: annaOwner, name: "Personal" });
    const folderId = await seedFolder(db.admin, {
      driveId,
      owner: annaOwner,
      parentId: null,
      name: "Holiday",
      trashed: true,
    });
    const childId = await seedRegularFile(db.admin, {
      driveId,
      owner: annaOwner,
      parentId: folderId,
      name: "sunset.jpg",
      sizeBytes: 3,
      createdByUserId: anna,
      trashed: true,
    });
    let releaseRestore = (): void => undefined;
    const restoreHeld = new Promise<void>((resolve) => {
      releaseRestore = resolve;
    });
    const restoring = writeAsUser(db.db, anna, async (tx) => {
      await restoreTrashedFile(tx, childId, {
        name: "sunset.jpg",
        parentId: null,
        updatedAt: new Date(),
      });
      await restoreHeld;
    });

    const purging = purgeTrashedRoot(db.db, storage, anna, folderId);
    await pause(300);
    releaseRestore();
    await restoring;

    expect(await purging).toEqual({ outcome: "found", value: null });
    const survivors = await db.admin.query<{ deleted_at: Date | null }>(
      "SELECT deleted_at FROM files.file WHERE file_id = $1",
      [childId],
    );
    expect(survivors.rows).toEqual([{ deleted_at: null }]);
    const versions = await db.admin.query(
      "SELECT version_id FROM files.file_version WHERE file_id = $1",
      [childId],
    );
    expect(versions.rows).toHaveLength(1);
  });

  it("answers restored when the root is restored while its purge runs", async () => {
    const driveId = await seedDrive(db.admin, { owner: annaOwner, name: "Personal" });
    const folderId = await seedFolder(db.admin, {
      driveId,
      owner: annaOwner,
      parentId: null,
      name: "Holiday",
      trashed: true,
    });
    await seedRegularFile(db.admin, {
      driveId,
      owner: annaOwner,
      parentId: folderId,
      name: "sunset.jpg",
      sizeBytes: 3,
      createdByUserId: anna,
      trashed: true,
    });
    let releaseRestore = (): void => undefined;
    const restoreHeld = new Promise<void>((resolve) => {
      releaseRestore = resolve;
    });
    const restoring = writeAsUser(db.db, anna, async (tx) => {
      await restoreTrashedFile(tx, folderId, {
        name: "Holiday",
        parentId: null,
        updatedAt: new Date(),
      });
      await restoreHeld;
    });

    const purging = purgeTrashedRoot(db.db, storage, anna, folderId);
    await pause(300);
    releaseRestore();
    await restoring;

    expect(await purging).toEqual({ outcome: "restored" });
    const files = await db.admin.query("SELECT file_id FROM files.file WHERE drive_id = $1", [
      driveId,
    ]);
    expect(files.rows.map((row: { file_id: string }) => row.file_id)).toContain(folderId);
  });
});
