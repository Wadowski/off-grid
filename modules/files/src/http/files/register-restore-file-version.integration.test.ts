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
import {
  bodyOf,
  putBytes,
  readFileRow,
  readVersionNumbers,
  storedKeys,
} from "../../../test/version-fixtures.js";
import { uploadFileVersion } from "../../application/files/upload-file-version.js";

describe("POST /files/:id/versions/:versionId/restore", { timeout: 60_000 }, () => {
  let db: FilesTestDatabase;
  let app: FastifyInstance;
  let storage: FileStorage;
  const anna = randomUUID();
  const ben = randomUUID();
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
    app = await createFilesTestApp(db, { storage, maxUploadBytes: DEFAULT_TEST_MAX_UPLOAD_BYTES });
    const owner = { userId: anna, familyId: null };
    const driveId = await seedDrive(db.admin, { owner, name: "Personal" });
    const stored = await putBytes(storage, "first");
    firstKey = stored.key;
    fileId = await seedRegularFile(db.admin, {
      driveId,
      owner,
      parentId: null,
      name: "Notes.txt",
      sizeBytes: stored.sizeBytes,
      createdByUserId: anna,
      storageKey: stored.key,
    });
    firstVersionId = (await readFileRow(db.admin, fileId)).current_version_id;
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
  });

  afterEach(async () => {
    await app.close();
  });

  const restore = (userId: string, versionId: string) =>
    app.inject({
      method: "POST",
      url: `/files/${fileId}/versions/${versionId}/restore`,
      headers: { "x-user-id": userId },
    });

  it("answers 200 with the file whose restored version is current", async () => {
    const response = await restore(anna, firstVersionId);

    expect(response.statusCode).toBe(200);
    expect(response.json()).toMatchObject({ id: fileId, size: 5, version: 3 });
    expect(await readVersionNumbers(db.admin, fileId)).toEqual([1, 2, 3]);
    expect(await storedKeys(storage)).toContain(firstKey);
  });

  it("answers 200 and changes nothing when the version is already current", async () => {
    const current = (await readFileRow(db.admin, fileId)).current_version_id;

    const response = await restore(anna, current);

    expect(response.statusCode).toBe(200);
    expect(response.json()).toMatchObject({ version: 2 });
    expect(await readVersionNumbers(db.admin, fileId)).toEqual([1, 2]);
  });

  it("answers 404 for a person outside the family", async () => {
    const response = await restore(ben, firstVersionId);

    expect(response.statusCode).toBe(404);
    expect(response.json()).toMatchObject({ code: "NOT_FOUND" });
  });

  it("answers 404 for an unknown version", async () => {
    const response = await restore(anna, randomUUID());

    expect(response.statusCode).toBe(404);
  });

  it("answers 400 for a malformed version id", async () => {
    const response = await app.inject({
      method: "POST",
      url: `/files/${fileId}/versions/not-a-uuid/restore`,
      headers: { "x-user-id": anna },
    });

    expect(response.statusCode).toBe(400);
  });
});
