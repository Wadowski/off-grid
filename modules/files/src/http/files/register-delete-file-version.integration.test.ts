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

describe("DELETE /files/:id/versions/:versionId", { timeout: 60_000 }, () => {
  let db: FilesTestDatabase;
  let app: FastifyInstance;
  let storage: FileStorage;
  const anna = randomUUID();
  const ben = randomUUID();
  let fileId: string;
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
    app = await createFilesTestApp(db, { storage, maxUploadBytes: DEFAULT_TEST_MAX_UPLOAD_BYTES });
    const owner = { userId: anna, familyId: null };
    const driveId = await seedDrive(db.admin, { owner, name: "Personal" });
    const stored = await putBytes(storage, "first");
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

  const remove = (userId: string, versionId: string) =>
    app.inject({
      method: "DELETE",
      url: `/files/${fileId}/versions/${versionId}`,
      headers: { "x-user-id": userId },
    });

  it("answers 204 and removes a non-current version and its bytes", async () => {
    const response = await remove(anna, firstVersionId);

    expect(response.statusCode).toBe(204);
    expect(await readVersionNumbers(db.admin, fileId)).toEqual([2]);
    expect(await storedKeys(storage)).toHaveLength(1);
  });

  it("answers 409 CURRENT_VERSION for the current version and removes nothing", async () => {
    const current = (await readFileRow(db.admin, fileId)).current_version_id;

    const response = await remove(anna, current);

    expect(response.statusCode).toBe(409);
    expect(response.json()).toMatchObject({ code: "CURRENT_VERSION" });
    expect(await readVersionNumbers(db.admin, fileId)).toEqual([1, 2]);
    expect(await storedKeys(storage)).toHaveLength(2);
  });

  it("answers 404 for a person outside the family", async () => {
    const response = await remove(ben, firstVersionId);

    expect(response.statusCode).toBe(404);
    expect(response.json()).toMatchObject({ code: "NOT_FOUND" });
  });

  it("answers 404 for a version that does not exist", async () => {
    const response = await remove(anna, randomUUID());

    expect(response.statusCode).toBe(404);
  });
});
