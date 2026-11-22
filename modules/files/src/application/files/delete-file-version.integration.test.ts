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
import {
  bodyOf,
  countFileUpdatedEvents,
  putBytes,
  readFileRow,
  readVersionNumbers,
  storedKeys,
} from "../../../test/version-fixtures.js";
import { CurrentVersionError } from "../errors/current-version-error.js";
import { deleteFileVersion } from "./delete-file-version.js";
import { uploadFileVersion } from "./upload-file-version.js";

const MAX_UPLOAD_BYTES = 1024;

describe("deleteFileVersion", { timeout: 60_000 }, () => {
  let db: FilesTestDatabase;
  let storage: FileStorage;
  const anna = randomUUID();
  const ben = randomUUID();
  const annaOwner: SeedOwner = { userId: anna, familyId: null };
  let driveId: string;
  let fileId: string;
  let firstVersionId: string;
  let firstKey: string;

  beforeAll(async () => {
    db = await startFilesTestDatabase();
  }, 120_000);

  afterAll(async () => {
    await db.stop();
  }, 120_000);

  beforeEach(async () => {
    await db.reset();
    await db.admin.query("TRUNCATE outbox.event, outbox.subscriber_cursor, outbox.dead_letter");
    storage = createInMemoryFileStorage();
    driveId = await seedDrive(db.admin, { owner: annaOwner, name: "Personal" });
    const stored = await putBytes(storage, "first");
    firstKey = stored.key;
    fileId = await seedRegularFile(db.admin, {
      driveId,
      owner: annaOwner,
      parentId: null,
      name: "Notes.txt",
      sizeBytes: stored.sizeBytes,
      createdByUserId: anna,
      storageKey: stored.key,
    });
    firstVersionId = (await readFileRow(db.admin, fileId)).current_version_id;
    await uploadFileVersion({ db: db.db, storage, maxUploadBytes: MAX_UPLOAD_BYTES }, anna, {
      fileId,
      declaredMimeType: null,
      body: bodyOf("second draft"),
      signal: new AbortController().signal,
    });
  });

  const remove = (userId: string, targetFileId: string, versionId: string) =>
    deleteFileVersion({ db: db.db, storage }, userId, targetFileId, versionId);

  it("removes a non-current version row and its bytes, and publishes no event", async () => {
    const before = await countFileUpdatedEvents(db.admin);

    const outcome = await remove(anna, fileId, firstVersionId);

    expect(outcome.outcome).toBe("found");
    expect(await readVersionNumbers(db.admin, fileId)).toEqual([2]);
    expect(await storedKeys(storage)).not.toContain(firstKey);
    expect(await countFileUpdatedEvents(db.admin)).toBe(before);
  });

  it("refuses to delete the current version and removes nothing", async () => {
    const current = (await readFileRow(db.admin, fileId)).current_version_id;
    const keysBefore = await storedKeys(storage);

    await expect(remove(anna, fileId, current)).rejects.toBeInstanceOf(CurrentVersionError);
    expect(await readVersionNumbers(db.admin, fileId)).toEqual([1, 2]);
    expect(await storedKeys(storage)).toEqual(keysBefore);
  });

  it("answers not-found for a version of another file", async () => {
    const otherFileId = await seedRegularFile(db.admin, {
      driveId,
      owner: annaOwner,
      parentId: null,
      name: "Other.txt",
      sizeBytes: 1,
      createdByUserId: anna,
    });

    expect(await remove(anna, otherFileId, firstVersionId)).toEqual({ outcome: "not-found" });
    expect(await readVersionNumbers(db.admin, fileId)).toEqual([1, 2]);
  });

  it("answers not-found for a file the person cannot see", async () => {
    expect(await remove(ben, fileId, firstVersionId)).toEqual({ outcome: "not-found" });
    expect(await readVersionNumbers(db.admin, fileId)).toEqual([1, 2]);
  });

  it("answers folder for a folder", async () => {
    const folderId = await seedFolder(db.admin, {
      driveId,
      owner: annaOwner,
      parentId: null,
      name: "Photos",
    });

    expect(await remove(anna, folderId, firstVersionId)).toEqual({ outcome: "folder" });
  });
});
