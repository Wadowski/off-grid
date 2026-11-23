// SPDX-FileCopyrightText: 2026 Dominik Wadowski
// SPDX-License-Identifier: FSL-1.1-ALv2

import { randomUUID } from "node:crypto";
import { createInMemoryFileStorage, type FileStorage } from "@offgrid/file-storage";
import type { FastifyInstance } from "fastify";
import { afterAll, afterEach, beforeAll, beforeEach, describe, expect, it } from "vitest";
import { createFilesTestApp } from "../../../test/create-files-test-app.js";
import { DEFAULT_TEST_MAX_UPLOAD_BYTES } from "../../../test/constants.js";
import { seedDrive } from "../../../test/seed-drive.js";
import { seedRegularFile } from "../../../test/seed-regular-file.js";
import { startFilesTestDatabase } from "../../../test/start-files-test-database.js";
import type { FilesTestDatabase } from "../../../test/types.js";
import { bodyOf, putBytes } from "../../../test/version-fixtures.js";
import { uploadFileVersion } from "../../application/files/upload-file-version.js";

describe("GET /files/:id/versions/:versionId/content", { timeout: 60_000 }, () => {
  let db: FilesTestDatabase;
  let app: FastifyInstance;
  let storage: FileStorage;
  const anna = randomUUID();
  const ben = randomUUID();
  let driveId: string;
  let fileId: string;
  let otherFileId: string;
  let firstVersionId: string;

  beforeAll(async () => {
    db = await startFilesTestDatabase();
  }, 120_000);

  afterAll(async () => {
    await db.stop();
  }, 120_000);

  const versionIdOf = async (targetFileId: string, number: number): Promise<string> => {
    const { rows } = await db.admin.query<{ version_id: string }>(
      "SELECT version_id FROM files.file_version WHERE file_id = $1 AND number = $2",
      [targetFileId, number],
    );
    return rows[0]?.version_id ?? "";
  };

  const download = (url: string, headers: Record<string, string> = {}, userId = anna) =>
    app.inject({ method: "GET", url, headers: { "x-user-id": userId, ...headers } });

  beforeEach(async () => {
    await db.reset();
    storage = createInMemoryFileStorage();
    app = await createFilesTestApp(db, { storage, maxUploadBytes: DEFAULT_TEST_MAX_UPLOAD_BYTES });
    const owner = { userId: anna, familyId: null };
    driveId = await seedDrive(db.admin, { owner, name: "Personal" });
    const stored = await putBytes(storage, "first draft");
    fileId = await seedRegularFile(db.admin, {
      driveId,
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
      driveId,
      owner,
      parentId: null,
      name: "Other.txt",
      sizeBytes: otherStored.sizeBytes,
      createdByUserId: anna,
      storageKey: otherStored.key,
    });
  });

  afterEach(async () => {
    await app.close();
  });

  it("answers 200 with the exact bytes of an earlier version and the safe headers", async () => {
    const response = await download(`/files/${fileId}/versions/${firstVersionId}/content`);

    expect(response.statusCode).toBe(200);
    expect(response.body).toBe("first draft");
    expect(response.headers).toMatchObject({
      "accept-ranges": "bytes",
      "cache-control": "private, no-store",
      "content-disposition": "attachment; filename=\"Notes.txt\"; filename*=UTF-8''Notes.txt",
      "content-length": "11",
      "content-type": "application/octet-stream",
      "x-content-type-options": "nosniff",
    });
  });

  it("answers 206 with the right bytes of a version range", async () => {
    const response = await download(`/files/${fileId}/versions/${firstVersionId}/content`, {
      range: "bytes=0-4",
    });

    expect(response.statusCode).toBe(206);
    expect(response.body).toBe("first");
    expect(response.headers["content-range"]).toBe("bytes 0-4/11");
  });

  it("answers 416 with the version size for a range past its end", async () => {
    const response = await download(`/files/${fileId}/versions/${firstVersionId}/content`, {
      range: "bytes=11-",
    });

    expect(response.statusCode).toBe(416);
    expect(response.headers["content-range"]).toBe("bytes */11");
  });

  it("answers 404 for a version of another file", async () => {
    const otherVersionId = await versionIdOf(otherFileId, 1);

    const response = await download(`/files/${fileId}/versions/${otherVersionId}/content`);

    expect(response.statusCode).toBe(404);
    expect(response.json()).toMatchObject({ code: "NOT_FOUND" });
  });

  it("answers 404 for a version that does not exist", async () => {
    const response = await download(`/files/${fileId}/versions/${randomUUID()}/content`);

    expect(response.statusCode).toBe(404);
  });

  it("answers 404 for a person who cannot see the file", async () => {
    const response = await download(`/files/${fileId}/versions/${firstVersionId}/content`, {}, ben);

    expect(response.statusCode).toBe(404);
  });

  it("answers 400 for a version id that is not valid", async () => {
    const response = await download(`/files/${fileId}/versions/not-an-id/content`);

    expect(response.statusCode).toBe(400);
    expect(response.json()).toMatchObject({ code: "VALIDATION_FAILED" });
  });

  it("answers 401 without a signed-in person", async () => {
    const response = await app.inject({
      method: "GET",
      url: `/files/${fileId}/versions/${firstVersionId}/content`,
    });

    expect(response.statusCode).toBe(401);
  });
});
