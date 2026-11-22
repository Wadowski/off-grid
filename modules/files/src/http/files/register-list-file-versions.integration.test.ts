// SPDX-FileCopyrightText: 2026 Dominik Wadowski
// SPDX-License-Identifier: FSL-1.1-ALv2

import { randomUUID } from "node:crypto";
import { createInMemoryFileStorage, type FileStorage } from "@offgrid/file-storage";
import type { FastifyInstance } from "fastify";
import { afterAll, afterEach, beforeAll, beforeEach, describe, expect, it } from "vitest";
import { createFilesTestApp } from "../../../test/create-files-test-app.js";
import { DEFAULT_TEST_MAX_UPLOAD_BYTES } from "../../../test/constants.js";
import { seedDrive } from "../../../test/seed-drive.js";
import { seedFolder } from "../../../test/seed-folder.js";
import { seedRegularFile } from "../../../test/seed-regular-file.js";
import { startFilesTestDatabase } from "../../../test/start-files-test-database.js";
import type { FilesTestDatabase } from "../../../test/types.js";
import { putBytes } from "../../../test/version-fixtures.js";

import { bodyOf } from "../../../test/version-fixtures.js";
import { uploadFileVersion } from "../../application/files/upload-file-version.js";

describe("GET /files/:id/versions", { timeout: 60_000 }, () => {
  let db: FilesTestDatabase;
  let app: FastifyInstance;
  let storage: FileStorage;
  const anna = randomUUID();
  const ben = randomUUID();
  let fileId: string;
  let folderId: string;

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
    folderId = await seedFolder(db.admin, { driveId, owner, parentId: null, name: "Photos" });
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

  it("answers 200 with every version, newest first", async () => {
    const response = await app.inject({
      method: "GET",
      url: `/files/${fileId}/versions`,
      headers: { "x-user-id": anna },
    });

    expect(response.statusCode).toBe(200);
    const body = response.json<{
      versions: { number: number; size: number; createdByUserId: string }[];
    }>();
    expect(body.versions.map((version) => version.number)).toEqual([2, 1]);
    expect(body.versions.map((version) => version.size)).toEqual([12, 5]);
    expect(body.versions[0]?.createdByUserId).toBe(anna);
    expect(JSON.stringify(body)).not.toContain("storage");
  });

  it("answers 404 for a person outside the family", async () => {
    const response = await app.inject({
      method: "GET",
      url: `/files/${fileId}/versions`,
      headers: { "x-user-id": ben },
    });

    expect(response.statusCode).toBe(404);
    expect(response.json()).toMatchObject({ code: "NOT_FOUND" });
  });

  it("answers 400 IS_FOLDER for a folder", async () => {
    const response = await app.inject({
      method: "GET",
      url: `/files/${folderId}/versions`,
      headers: { "x-user-id": anna },
    });

    expect(response.statusCode).toBe(400);
    expect(response.json()).toMatchObject({ code: "IS_FOLDER" });
  });

  it("answers 401 without a signed-in person", async () => {
    const response = await app.inject({ method: "GET", url: `/files/${fileId}/versions` });

    expect(response.statusCode).toBe(401);
  });
});
