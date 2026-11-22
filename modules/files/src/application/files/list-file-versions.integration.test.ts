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
import { bodyOf, putBytes } from "../../../test/version-fixtures.js";
import { listFileVersions } from "./list-file-versions.js";
import { uploadFileVersion } from "./upload-file-version.js";

const MAX_UPLOAD_BYTES = 1024;

describe("listFileVersions", { timeout: 60_000 }, () => {
  let db: FilesTestDatabase;
  let storage: FileStorage;
  const anna = randomUUID();
  const ben = randomUUID();
  const annaOwner: SeedOwner = { userId: anna, familyId: null };
  let driveId: string;
  let fileId: string;

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
    fileId = await seedRegularFile(db.admin, {
      driveId,
      owner: annaOwner,
      parentId: null,
      name: "Notes.txt",
      sizeBytes: stored.sizeBytes,
      createdByUserId: anna,
      storageKey: stored.key,
    });
    await uploadFileVersion({ db: db.db, storage, maxUploadBytes: MAX_UPLOAD_BYTES }, anna, {
      fileId,
      declaredMimeType: null,
      body: bodyOf("second draft"),
      signal: new AbortController().signal,
    });
  });

  it("lists every version newest first with the media type and size of each", async () => {
    const outcome = await listFileVersions(db.db, anna, fileId);

    expect(outcome.outcome).toBe("found");
    if (outcome.outcome !== "found") {
      return;
    }
    expect(outcome.value.map((version) => version.number)).toEqual([2, 1]);
    expect(outcome.value.map((version) => Number(version.sizeBytes))).toEqual([12, 5]);
    expect(outcome.value.every((version) => version.createdByUserId === anna)).toBe(true);
  });

  it("answers not-found for a file the person cannot see", async () => {
    expect(await listFileVersions(db.db, ben, fileId)).toEqual({ outcome: "not-found" });
  });

  it("answers not-found for a trashed file", async () => {
    await db.admin.query("UPDATE files.file SET deleted_at = now() WHERE file_id = $1", [fileId]);

    expect(await listFileVersions(db.db, anna, fileId)).toEqual({ outcome: "not-found" });
  });

  it("answers folder for a folder", async () => {
    const folderId = await seedFolder(db.admin, {
      driveId,
      owner: annaOwner,
      parentId: null,
      name: "Photos",
    });

    expect(await listFileVersions(db.db, anna, folderId)).toEqual({ outcome: "folder" });
  });
});
