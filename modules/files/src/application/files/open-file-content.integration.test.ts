// SPDX-FileCopyrightText: 2026 Dominik Wadowski
// SPDX-License-Identifier: FSL-1.1-ALv2

import { randomUUID } from "node:crypto";
import type { Readable } from "node:stream";
import { allocateStorageKey, createInMemoryFileStorage } from "@offgrid/file-storage";
import type { FileStorage } from "@offgrid/file-storage";
import { afterAll, beforeAll, beforeEach, describe, expect, it } from "vitest";
import { DEFAULT_TEST_MAX_UPLOAD_BYTES } from "../../../test/constants.js";
import { seedDrive } from "../../../test/seed-drive.js";
import { seedFolder } from "../../../test/seed-folder.js";
import { seedRegularFile } from "../../../test/seed-regular-file.js";
import { startFilesTestDatabase } from "../../../test/start-files-test-database.js";
import type { FilesTestDatabase } from "../../../test/types.js";
import { bodyOf, putBytes } from "../../../test/version-fixtures.js";
import { uploadFileVersion } from "./upload-file-version.js";
import { openFileContent } from "./open-file-content.js";

describe("openFileContent", { timeout: 60_000 }, () => {
  let db: FilesTestDatabase;
  let storage: FileStorage;
  const anna = randomUUID();
  const ben = randomUUID();
  const carl = randomUUID();
  const familyId = randomUUID();
  let personalDriveId: string;
  let fileId: string;
  let firstVersionId: string;
  let otherFileId: string;

  beforeAll(async () => {
    db = await startFilesTestDatabase();
  }, 120_000);

  afterAll(async () => {
    await db.stop();
  }, 120_000);

  const readStream = async (stream: Readable): Promise<string> => {
    const chunks: Buffer[] = [];
    for await (const chunk of stream) {
      chunks.push(Buffer.from(chunk));
    }
    return Buffer.concat(chunks).toString("utf8");
  };

  const versionIdOf = async (targetFileId: string, number: number): Promise<string> => {
    const { rows } = await db.admin.query<{ version_id: string }>(
      "SELECT version_id FROM files.file_version WHERE file_id = $1 AND number = $2",
      [targetFileId, number],
    );
    return rows[0]?.version_id ?? "";
  };

  beforeEach(async () => {
    await db.reset();
    await db.admin.query(
      "INSERT INTO files.family_membership (family_id, user_id, source_version, is_member) VALUES ($1, $2, 1, true)",
      [familyId, ben],
    );
    storage = createInMemoryFileStorage();
    const owner = { userId: anna, familyId: null };
    personalDriveId = await seedDrive(db.admin, { owner, name: "Personal" });
    const stored = await putBytes(storage, "first draft");
    fileId = await seedRegularFile(db.admin, {
      driveId: personalDriveId,
      owner,
      parentId: null,
      name: "Notes.txt",
      sizeBytes: stored.sizeBytes,
      createdByUserId: anna,
      storageKey: stored.key,
    });
    firstVersionId = await versionIdOf(fileId, 1);
    await uploadFileVersion(
      { db: db.db, storage, maxUploadBytes: DEFAULT_TEST_MAX_UPLOAD_BYTES },
      anna,
      {
        fileId,
        declaredMimeType: null,
        body: bodyOf("second draft"),
        signal: new AbortController().signal,
      },
    );
    const otherStored = await putBytes(storage, "other");
    otherFileId = await seedRegularFile(db.admin, {
      driveId: personalDriveId,
      owner,
      parentId: null,
      name: "Other.txt",
      sizeBytes: otherStored.sizeBytes,
      createdByUserId: anna,
      storageKey: otherStored.key,
    });
  });

  const open = (
    userId: string,
    targetFileId: string,
    versionId: string | null,
    rangeHeader?: string,
  ) =>
    openFileContent({ db: db.db, storage }, userId, {
      fileId: targetFileId,
      versionId,
      rangeHeader,
    });

  it("returns the bytes of the current version", async () => {
    const outcome = await open(anna, fileId, null);

    expect(outcome.outcome).toBe("found");
    if (outcome.outcome !== "found") {
      return;
    }
    expect(outcome.value).toMatchObject({ fileName: "Notes.txt", sizeBytes: 12, span: null });
    expect(await readStream(outcome.value.stream)).toBe("second draft");
  });

  it("returns the bytes of a named earlier version", async () => {
    const outcome = await open(anna, fileId, firstVersionId);

    expect(outcome.outcome).toBe("found");
    if (outcome.outcome !== "found") {
      return;
    }
    expect(await readStream(outcome.value.stream)).toBe("first draft");
  });

  it("returns the bytes of a range", async () => {
    const outcome = await open(anna, fileId, null, "bytes=1-3");

    expect(outcome.outcome).toBe("found");
    if (outcome.outcome !== "found") {
      return;
    }
    expect(outcome.value.span).toEqual({ start: 1, end: 3 });
    expect(await readStream(outcome.value.stream)).toBe("eco");
  });

  it("refuses a range past the end with the file size", async () => {
    expect(await open(anna, fileId, null, "bytes=50-60")).toEqual({
      outcome: "range-not-satisfiable",
      sizeBytes: 12,
    });
  });

  it("answers not-found for a version of another file", async () => {
    const otherVersionId = await versionIdOf(otherFileId, 1);

    expect(await open(anna, fileId, otherVersionId)).toEqual({ outcome: "not-found" });
  });

  it("answers not-found for a version that does not exist", async () => {
    expect(await open(anna, fileId, randomUUID())).toEqual({ outcome: "not-found" });
  });

  it("answers not-found for a person who cannot see the file", async () => {
    expect(await open(carl, fileId, null)).toEqual({ outcome: "not-found" });
  });

  it("answers not-found for a trashed file", async () => {
    const trashedFileId = await seedRegularFile(db.admin, {
      driveId: personalDriveId,
      owner: { userId: anna, familyId: null },
      parentId: null,
      name: "Gone.txt",
      sizeBytes: 0,
      createdByUserId: anna,
      trashed: true,
    });

    expect(await open(anna, trashedFileId, null)).toEqual({ outcome: "not-found" });
  });

  it("answers folder for a folder", async () => {
    const folderId = await seedFolder(db.admin, {
      driveId: personalDriveId,
      owner: { userId: anna, familyId: null },
      parentId: null,
      name: "Photos",
    });

    expect(await open(anna, folderId, null)).toEqual({ outcome: "folder" });
  });

  it("answers not-found when the stored bytes are missing", async () => {
    const missingFileId = await seedRegularFile(db.admin, {
      driveId: personalDriveId,
      owner: { userId: anna, familyId: null },
      parentId: null,
      name: "Lost.txt",
      sizeBytes: 4,
      createdByUserId: anna,
      storageKey: await allocateStorageKey(async () => false),
    });

    expect(await open(anna, missingFileId, null)).toEqual({ outcome: "not-found" });
  });

  it("lets a family member read a family file through the membership projection", async () => {
    const familyDriveId = await seedDrive(db.admin, {
      owner: { userId: null, familyId },
      name: "Family",
    });
    const stored = await putBytes(storage, "family plan");
    const familyFileId = await seedRegularFile(db.admin, {
      driveId: familyDriveId,
      owner: { userId: null, familyId },
      parentId: null,
      name: "Plan.txt",
      sizeBytes: stored.sizeBytes,
      createdByUserId: anna,
      storageKey: stored.key,
    });

    const outcome = await open(ben, familyFileId, null);

    expect(outcome.outcome).toBe("found");
    if (outcome.outcome !== "found") {
      return;
    }
    expect(await readStream(outcome.value.stream)).toBe("family plan");
  });
});
