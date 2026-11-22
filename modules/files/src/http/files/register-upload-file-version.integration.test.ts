// SPDX-FileCopyrightText: 2026 Dominik Wadowski
// SPDX-License-Identifier: FSL-1.1-ALv2

import { randomUUID } from "node:crypto";
import { Readable } from "node:stream";
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
import {
  putBytes,
  readFileRow,
  readVersionNumbers,
  storedKeys,
} from "../../../test/version-fixtures.js";

describe("POST /files/:id/versions", { timeout: 60_000 }, () => {
  let db: FilesTestDatabase;
  let app: FastifyInstance;
  let storage: FileStorage;
  const familyId = randomUUID();
  const anna = randomUUID();
  const ben = randomUUID();
  const annaHeaders = { "x-user-id": anna };
  let fileId: string;
  let folderId: string;
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
    await db.admin.query(
      "INSERT INTO files.family_membership (family_id, user_id, source_version, is_member) VALUES ($1, $2, 1, true)",
      [familyId, anna],
    );
    const driveId = await seedDrive(db.admin, {
      owner: { userId: anna, familyId: null },
      name: "Personal",
    });
    const stored = await putBytes(storage, "first");
    firstKey = stored.key;
    fileId = await seedRegularFile(db.admin, {
      driveId,
      owner: { userId: anna, familyId: null },
      parentId: null,
      name: "Notes.txt",
      sizeBytes: stored.sizeBytes,
      createdByUserId: anna,
      storageKey: stored.key,
    });
    folderId = await seedFolder(db.admin, {
      driveId,
      owner: { userId: anna, familyId: null },
      parentId: null,
      name: "Photos",
    });
  });

  afterEach(async () => {
    await app.close();
  });

  const uploadVersion = (
    targetId: string,
    body: string | Readable,
    headers: Record<string, string>,
    userHeaders: Record<string, string> = annaHeaders,
  ) =>
    app.inject({
      method: "POST",
      url: `/files/${targetId}/versions`,
      headers: { "content-type": "text/plain", ...userHeaders, ...headers },
      payload: body,
    });

  it("answers 201 with the file whose new version is current", async () => {
    const response = await uploadVersion(fileId, "second draft", {});

    expect(response.statusCode).toBe(201);
    expect(response.json()).toMatchObject({ id: fileId, isFolder: false, size: 12, version: 2 });
    expect(await readVersionNumbers(db.admin, fileId)).toEqual([1, 2]);
    expect((await readFileRow(db.admin, fileId)).current_version_id).toBeTruthy();
  });

  it("keeps the declared media type on the new version", async () => {
    const response = await uploadVersion(fileId, "# Draft", {
      "content-type": "text/markdown; charset=utf-8",
    });

    expect(response.json()).toMatchObject({ mimeType: "text/markdown" });
  });

  it("answers 404 for a person outside the family and stores no bytes", async () => {
    const response = await uploadVersion(fileId, "intruder", {}, { "x-user-id": ben });

    expect(response.statusCode).toBe(404);
    expect(response.json()).toMatchObject({ code: "NOT_FOUND" });
    expect(await storedKeys(storage)).toEqual([firstKey]);
  });

  it("answers 400 IS_FOLDER for a folder", async () => {
    const response = await uploadVersion(folderId, "new", {});

    expect(response.statusCode).toBe(400);
    expect(response.json()).toMatchObject({ code: "IS_FOLDER" });
  });

  it("answers 401 without a signed-in person", async () => {
    const response = await uploadVersion(fileId, "new", {}, {});

    expect(response.statusCode).toBe(401);
  });

  it("answers 413 from the declared length before reading the body, and keeps the current version", async () => {
    const oversized = "x".repeat(DEFAULT_TEST_MAX_UPLOAD_BYTES + 1);

    const response = await uploadVersion(fileId, oversized, {
      "content-length": String(oversized.length),
    });

    expect(response.statusCode).toBe(413);
    expect(response.json()).toMatchObject({ code: "PAYLOAD_TOO_LARGE" });
    expect(await readVersionNumbers(db.admin, fileId)).toEqual([1]);
    expect(await storedKeys(storage)).toEqual([firstKey]);
  });

  it("answers 413 for a streamed body that grows past the limit, and keeps no bytes or rows", async () => {
    const oversized = Readable.from([Buffer.alloc(DEFAULT_TEST_MAX_UPLOAD_BYTES), Buffer.alloc(1)]);

    const response = await uploadVersion(fileId, oversized, {});

    expect(response.statusCode).toBe(413);
    expect(await readVersionNumbers(db.admin, fileId)).toEqual([1]);
    expect(await storedKeys(storage)).toEqual([firstKey]);
  });
});
