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
  readBytes,
  readFileRow,
  readVersionNumbers,
  storedKeys,
} from "../../../test/version-fixtures.js";
import { restoreFileVersion } from "./restore-file-version.js";
import { uploadFileVersion } from "./upload-file-version.js";

const MAX_UPLOAD_BYTES = 1024;

describe("restoreFileVersion", { timeout: 60_000 }, () => {
  let db: FilesTestDatabase;
  let storage: FileStorage;
  const anna = randomUUID();
  const ben = randomUUID();
  const annaOwner: SeedOwner = { userId: anna, familyId: null };
  let driveId: string;
  let fileId: string;
  let firstKey: string;
  let firstVersionId: string;

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

  const restore = (userId: string, targetFileId: string, versionId: string) =>
    restoreFileVersion({ db: db.db, storage }, userId, targetFileId, versionId);

  it("adds a new version with copied bytes, makes it current and keeps the old row", async () => {
    const outcome = await restore(anna, fileId, firstVersionId);

    expect(outcome.outcome).toBe("found");
    expect(await readVersionNumbers(db.admin, fileId)).toEqual([1, 2, 3]);
    const row = await readFileRow(db.admin, fileId);
    expect(row.current_version_id).not.toBe(firstVersionId);
    expect(row.version).toBe(3);
    expect(Number(row.size_bytes)).toBe("first".length);
    const { rows } = await db.admin.query<{ storage_key: string }>(
      "SELECT storage_key FROM files.file_version WHERE version_id = $1",
      [firstVersionId],
    );
    expect(rows[0]?.storage_key).toBe(firstKey);
  });

  it("copies the bytes to a new storage key with the same content", async () => {
    const outcome = await restore(anna, fileId, firstVersionId);

    expect(outcome.outcome).toBe("found");
    const keys = await storedKeys(storage);
    expect(keys).toHaveLength(3);
    const { rows } = await db.admin.query<{ storage_key: string }>(
      "SELECT storage_key FROM files.file_version WHERE file_id = $1 AND number = 3",
      [fileId],
    );
    const restoredKey = rows[0]?.storage_key ?? "";
    expect(restoredKey).not.toBe(firstKey);
    expect(await readBytes(storage, restoredKey)).toBe("first");
  });

  it("publishes one updated event for a restore", async () => {
    const before = await countFileUpdatedEvents(db.admin);

    await restore(anna, fileId, firstVersionId);

    expect((await countFileUpdatedEvents(db.admin)) - before).toBe(1);
  });

  it("returns the file unchanged and publishes nothing when the version is already current", async () => {
    const current = (await readFileRow(db.admin, fileId)).current_version_id;
    const before = await countFileUpdatedEvents(db.admin);
    const keysBefore = await storedKeys(storage);

    const outcome = await restore(anna, fileId, current);

    expect(outcome.outcome).toBe("found");
    expect(await readVersionNumbers(db.admin, fileId)).toEqual([1, 2]);
    expect(await countFileUpdatedEvents(db.admin)).toBe(before);
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
    const otherVersionId = (await readFileRow(db.admin, otherFileId)).current_version_id;

    expect(await restore(anna, fileId, otherVersionId)).toEqual({ outcome: "not-found" });
  });

  it("answers not-found for a file the person cannot see and changes nothing", async () => {
    expect(await restore(ben, fileId, firstVersionId)).toEqual({ outcome: "not-found" });
    expect(await readVersionNumbers(db.admin, fileId)).toEqual([1, 2]);
  });

  it("answers folder for a folder", async () => {
    const folderId = await seedFolder(db.admin, {
      driveId,
      owner: annaOwner,
      parentId: null,
      name: "Photos",
    });

    expect(await restore(anna, folderId, randomUUID())).toEqual({ outcome: "folder" });
  });

  it("leaves the rows unchanged when the stored bytes of the old version are missing", async () => {
    const missingId = await seedRegularFile(db.admin, {
      driveId,
      owner: annaOwner,
      parentId: null,
      name: "Lost.txt",
      sizeBytes: 4,
      createdByUserId: anna,
      storageKey: "missing-key",
    });
    const lostVersionId = (await readFileRow(db.admin, missingId)).current_version_id;
    await uploadFileVersion({ db: db.db, storage, maxUploadBytes: MAX_UPLOAD_BYTES }, anna, {
      fileId: missingId,
      declaredMimeType: null,
      body: bodyOf("newer"),
      signal: new AbortController().signal,
    });
    const keysBefore = await storedKeys(storage);

    await expect(restore(anna, missingId, lostVersionId)).rejects.toThrow();
    expect(await readVersionNumbers(db.admin, missingId)).toEqual([1, 2]);
    expect(await storedKeys(storage)).toEqual(keysBefore);
  });
});
