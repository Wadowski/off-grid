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
  putBytes,
  readBytes,
  readFileRow,
  readVersionNumbers,
  storedKeys,
} from "../../../test/version-fixtures.js";
import { UploadTooLargeError } from "../errors/upload-too-large-error.js";
import { uploadFileVersion } from "./upload-file-version.js";

const MAX_UPLOAD_BYTES = 1024;

describe("uploadFileVersion", { timeout: 60_000 }, () => {
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
    const row = await readFileRow(db.admin, fileId);
    firstVersionId = row.current_version_id;
  });

  const upload = (userId: string, targetFileId: string, text: string, mimeType: string | null) =>
    uploadFileVersion({ db: db.db, storage, maxUploadBytes: MAX_UPLOAD_BYTES }, userId, {
      fileId: targetFileId,
      declaredMimeType: mimeType,
      body: bodyOf(text),
      signal: new AbortController().signal,
    });

  it("adds a version that becomes current, keeps the old one and bumps the file", async () => {
    const outcome = await upload(anna, fileId, "second draft", "text/markdown");

    expect(outcome.outcome).toBe("found");
    if (outcome.outcome !== "found") {
      return;
    }
    expect(outcome.value.sizeBytes).toBe(BigInt("second draft".length));
    expect(outcome.value.mimeType).toBe("text/markdown");
    expect(outcome.value.version).toBe(2);
    expect(await readVersionNumbers(db.admin, fileId)).toEqual([1, 2]);
    const row = await readFileRow(db.admin, fileId);
    expect(row.current_version_id).not.toBe(firstVersionId);
    expect(row.version).toBe(2);
    expect(row.mime_type).toBe("text/markdown");
  });

  it("publishes one updated event that carries no storage key", async () => {
    await upload(anna, fileId, "second draft", null);

    const { rows } = await db.admin.query<{ source_version: number; payload: unknown }>(
      "SELECT source_version, payload FROM outbox.event WHERE type = 'file-updated-v1'",
    );
    expect(rows).toHaveLength(1);
    expect(Number(rows[0]?.source_version)).toBe(2);
    const serialized = JSON.stringify(rows[0]?.payload);
    expect(serialized).not.toContain(firstKey);
    expect(serialized).not.toContain("second draft");
  });

  it("keeps the current media type when the upload declares none", async () => {
    const outcome = await upload(anna, fileId, "second draft", null);

    expect(outcome.outcome === "found" && outcome.value.mimeType).toBe("text/plain");
  });

  it("answers not-found for a file the person cannot see, and stores no bytes", async () => {
    const outcome = await upload(ben, fileId, "intruder", null);

    expect(outcome).toEqual({ outcome: "not-found" });
    expect(await storedKeys(storage)).toEqual([firstKey]);
    expect(await readVersionNumbers(db.admin, fileId)).toEqual([1]);
  });

  it("answers not-found for a trashed file", async () => {
    const trashedId = await seedRegularFile(db.admin, {
      driveId,
      owner: annaOwner,
      parentId: null,
      name: "Old.txt",
      sizeBytes: 3,
      createdByUserId: anna,
      trashed: true,
    });

    expect(await upload(anna, trashedId, "new", null)).toEqual({ outcome: "not-found" });
  });

  it("answers folder for a folder and stores no bytes", async () => {
    const folderId = await seedFolder(db.admin, {
      driveId,
      owner: annaOwner,
      parentId: null,
      name: "Photos",
    });

    expect(await upload(anna, folderId, "new", null)).toEqual({ outcome: "folder" });
    expect(await storedKeys(storage)).toEqual([firstKey]);
  });

  it("refuses an upload over the size limit and keeps the current version", async () => {
    const oversized = "x".repeat(MAX_UPLOAD_BYTES + 1);

    await expect(upload(anna, fileId, oversized, null)).rejects.toBeInstanceOf(UploadTooLargeError);
    expect(await readVersionNumbers(db.admin, fileId)).toEqual([1]);
    expect(await storedKeys(storage)).toEqual([firstKey]);
    expect(await readBytes(storage, firstKey)).toBe("first");
  });

  it("gives two simultaneous uploads distinct version numbers", async () => {
    const [first, second] = await Promise.all([
      upload(anna, fileId, "draft two", null),
      upload(anna, fileId, "draft three", null),
    ]);

    expect(first.outcome).toBe("found");
    expect(second.outcome).toBe("found");
    expect(await readVersionNumbers(db.admin, fileId)).toEqual([1, 2, 3]);
  });
});
