// SPDX-FileCopyrightText: 2026 Dominik Wadowski
// SPDX-License-Identifier: FSL-1.1-ALv2

import { randomUUID } from "node:crypto";
import { createInMemoryFileStorage } from "@offgrid/file-storage";
import { withUserContext } from "@offgrid/db";
import { afterAll, beforeAll, beforeEach, describe, expect, it } from "vitest";
import { startFilesTestDatabase } from "./start-files-test-database.js";
import { seedFamilyDrive } from "./family-membership.js";
import type { FilesTestDatabase } from "./types.js";
import { bodyOf, storedKeys } from "./version-fixtures.js";
import { deleteFileVersion } from "../src/application/files/delete-file-version.js";
import { listFileVersions } from "../src/application/files/list-file-versions.js";
import { restoreFileVersion } from "../src/application/files/restore-file-version.js";
import { uploadFileVersion } from "../src/application/files/upload-file-version.js";
import { emptyDriveTrash } from "../src/application/trash/empty-drive-trash.js";
import { listDriveTrash } from "../src/application/trash/list-drive-trash.js";
import { purgeFile } from "../src/application/trash/purge-file.js";
import { restoreFile } from "../src/application/trash/restore-file.js";
import { trashFile } from "../src/application/trash/trash-file.js";

describe("files family isolation", { timeout: 60_000 }, () => {
  let db: FilesTestDatabase;
  const familyA = randomUUID();
  const familyB = randomUUID();
  const anna = randomUUID();
  const ben = randomUUID();

  beforeAll(async () => {
    db = await startFilesTestDatabase();
  }, 120_000);

  afterAll(async () => {
    await db.stop();
  }, 120_000);

  const readAs = <T>(
    userId: string,
    read: (tx: Parameters<Parameters<typeof db.db.$transaction>[0]>[0]) => Promise<T>,
  ) =>
    db.db.$transaction(async (tx) => {
      await withUserContext(tx, userId);
      return read(tx);
    });

  beforeEach(async () => {
    await db.reset();
    await db.admin.query(
      `INSERT INTO files.family_membership (family_id, user_id, source_version, is_member) VALUES
         ($1, $2, 1, true), ($3, $4, 1, true)`,
      [familyA, anna, familyB, ben],
    );
  });

  it("shows Anna only family A's drive, files and versions", async () => {
    const a = await seedFamilyDrive(db.admin, familyA, "Alpha");
    const b = await seedFamilyDrive(db.admin, familyB, "Beta");

    const drives = await readAs(anna, (tx) => tx.filesDrive.findMany());
    const files = await readAs(anna, (tx) => tx.filesFile.findMany());
    const versions = await readAs(anna, (tx) => tx.filesFileVersion.findMany());

    expect(drives.map((row) => row.driveId)).toEqual([a.driveId]);
    expect(files.map((row) => row.fileId)).toEqual([a.fileId]);
    expect(versions.map((row) => row.versionId)).toEqual([a.versionId]);
    expect(drives.map((row) => row.driveId)).not.toContain(b.driveId);
  });

  it("shows Ben only family B's drive", async () => {
    await seedFamilyDrive(db.admin, familyA, "Alpha");
    const b = await seedFamilyDrive(db.admin, familyB, "Beta");

    const drives = await readAs(ben, (tx) => tx.filesDrive.findMany());

    expect(drives.map((row) => row.driveId)).toEqual([b.driveId]);
  });

  it("hides family A from Anna once her removal is applied", async () => {
    await seedFamilyDrive(db.admin, familyA, "Alpha");
    await db.admin.query(
      "UPDATE files.family_membership SET source_version = 2, is_member = false WHERE family_id = $1 AND user_id = $2",
      [familyA, anna],
    );

    const drives = await readAs(anna, (tx) => tx.filesDrive.findMany());
    const files = await readAs(anna, (tx) => tx.filesFile.findMany());

    expect(drives).toEqual([]);
    expect(files).toEqual([]);
  });
  it("answers not-found for a family file's versions to an outsider and to an ex-member", async () => {
    const family = await seedFamilyDrive(db.admin, familyA, "Alpha");
    const storage = createInMemoryFileStorage();
    const dependencies = { db: db.db, storage, maxUploadBytes: 1024 };
    const notFound = { outcome: "not-found" };
    const checkNotVisible = async (userId: string) => {
      expect(await listFileVersions(db.db, userId, family.fileId)).toEqual(notFound);
      expect(
        await uploadFileVersion(dependencies, userId, {
          fileId: family.fileId,
          declaredMimeType: null,
          body: bodyOf("intruder"),
          signal: new AbortController().signal,
        }),
      ).toEqual(notFound);
      expect(
        await restoreFileVersion(dependencies, userId, family.fileId, family.versionId),
      ).toEqual(notFound);
      expect(
        await deleteFileVersion(dependencies, userId, family.fileId, family.versionId),
      ).toEqual(notFound);
    };

    await checkNotVisible(ben);
    await db.admin.query(
      "UPDATE files.family_membership SET source_version = 2, is_member = false WHERE family_id = $1 AND user_id = $2",
      [familyA, anna],
    );
    await checkNotVisible(anna);
    expect(await storedKeys(storage)).toEqual([]);
  });

  it("lets a current member trash and restore a family file", async () => {
    const family = await seedFamilyDrive(db.admin, familyA, "Alpha");

    expect((await trashFile(db.db, anna, family.fileId)).outcome).toBe("found");
    expect((await restoreFile(db.db, anna, family.fileId)).outcome).toBe("found");
  });

  it("answers not-found for a family trash, restore and purge to an outsider and to an ex-member", async () => {
    const family = await seedFamilyDrive(db.admin, familyA, "Alpha");
    const storage = createInMemoryFileStorage();
    const notFound = { outcome: "not-found" };
    await trashFile(db.db, anna, family.fileId);
    const checkNotVisible = async (userId: string) => {
      expect(
        await listDriveTrash(db.db, userId, family.driveId, { cursor: null, limit: 50 }),
      ).toEqual(notFound);
      expect(await restoreFile(db.db, userId, family.fileId)).toEqual(notFound);
      expect(await purgeFile(db.db, storage, userId, family.fileId)).toEqual(notFound);
      expect(await emptyDriveTrash(db.db, storage, userId, family.driveId)).toEqual(notFound);
    };

    await checkNotVisible(ben);
    await db.admin.query(
      "UPDATE files.family_membership SET source_version = 2, is_member = false WHERE family_id = $1 AND user_id = $2",
      [familyA, anna],
    );
    await checkNotVisible(anna);
    const row = await db.admin.query<{ deleted_at: Date | null }>(
      "SELECT deleted_at FROM files.file WHERE file_id = $1",
      [family.fileId],
    );
    expect(row.rows[0]?.deleted_at).toBeInstanceOf(Date);
    expect(await storedKeys(storage)).toEqual([]);
  });
});
