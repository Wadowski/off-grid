// SPDX-FileCopyrightText: 2026 Dominik Wadowski
// SPDX-License-Identifier: FSL-1.1-ALv2

import { createHash, randomUUID } from "node:crypto";
import { Readable } from "node:stream";
import { createInMemoryFileStorage, type FileStorage } from "@offgrid/file-storage";
import type { FastifyInstance } from "fastify";
import { afterAll, afterEach, beforeAll, beforeEach, describe, expect, it } from "vitest";
import { createFilesTestApp } from "../../../test/create-files-test-app.js";
import { DEFAULT_TEST_MAX_UPLOAD_BYTES } from "../../../test/constants.js";
import { seedDrive } from "../../../test/seed-drive.js";
import { seedFolder } from "../../../test/seed-folder.js";
import { startFilesTestDatabase } from "../../../test/start-files-test-database.js";
import type { FilesTestDatabase } from "../../../test/types.js";

describe("POST /drives/:id/files", { timeout: 60_000 }, () => {
  let db: FilesTestDatabase;
  let app: FastifyInstance;
  let storage: FileStorage;
  const familyId = randomUUID();
  const anna = randomUUID();
  const ben = randomUUID();
  const annaHeaders = { "x-user-id": anna };

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
  });

  afterEach(async () => {
    await app.close();
  });

  const storedKeys = async (): Promise<string[]> => {
    const keys: string[] = [];
    for await (const entry of storage.listKeys()) {
      keys.push(entry.key);
    }
    return keys;
  };

  const countFiles = async (): Promise<number> => {
    const { rows } = await db.admin.query<{ count: string }>(
      "SELECT count(*) FROM files.file WHERE is_folder = false",
    );
    return Number(rows[0]?.count ?? 0);
  };

  const upload = (
    driveId: string,
    body: string | Readable,
    headers: Record<string, string>,
    userHeaders: Record<string, string> = annaHeaders,
  ) =>
    app.inject({
      method: "POST",
      url: `/drives/${driveId}/files`,
      headers: { "content-type": "text/plain", ...userHeaders, ...headers },
      payload: body,
    });

  it("answers 201 with the file and stores its bytes", async () => {
    const driveId = await seedDrive(db.admin, {
      owner: { userId: anna, familyId: null },
      name: "Personal",
    });
    const content = "Holiday notes";

    const response = await upload(driveId, content, {
      "x-offgrid-file-name": encodeURIComponent("Holiday notes.txt"),
    });

    expect(response.statusCode).toBe(201);
    expect(response.json()).toMatchObject({
      name: "Holiday notes.txt",
      driveId,
      parentId: null,
      isFolder: false,
      version: 1,
      mimeType: "text/plain",
      size: content.length,
    });
    const [key] = await storedKeys();
    const { rows } = await db.admin.query<{ sha256: string }>(
      "SELECT sha256 FROM files.file_version",
    );
    expect(rows[0]?.sha256).toBe(createHash("sha256").update(content).digest("hex"));
    expect(key).toBeDefined();
  });

  it("uploads into a folder of the family drive for a member", async () => {
    const driveId = await seedDrive(db.admin, {
      owner: { userId: null, familyId },
      name: "The Smiths",
    });
    const folderId = await seedFolder(db.admin, {
      driveId,
      owner: { userId: null, familyId },
      parentId: null,
      name: "Photos",
    });

    const response = await upload(driveId, "pixels", {
      "x-offgrid-file-name": "Beach.jpg",
      "x-offgrid-parent-id": folderId,
      "content-type": "image/jpeg; charset=binary",
    });

    expect(response.statusCode).toBe(201);
    expect(response.json()).toMatchObject({ parentId: folderId, mimeType: "image/jpeg" });
  });

  it("takes the media type from the extension when no content type is sent", async () => {
    const driveId = await seedDrive(db.admin, {
      owner: { userId: anna, familyId: null },
      name: "Personal",
    });
    const request = app.inject({
      method: "POST",
      url: `/drives/${driveId}/files`,
      headers: { ...annaHeaders, "x-offgrid-file-name": "Report.PDF" },
      payload: Buffer.from("%PDF"),
    });

    const response = await request;

    expect(response.statusCode).toBe(201);
    expect(response.json()).toMatchObject({ mimeType: "application/pdf" });
  });

  it("answers 415 for a content type that cannot be parsed as a media type", async () => {
    const driveId = await seedDrive(db.admin, {
      owner: { userId: anna, familyId: null },
      name: "Personal",
    });

    const response = await upload(driveId, "x", {
      "x-offgrid-file-name": "A.txt",
      "content-type": "not a media type",
    });

    expect(response.statusCode).toBe(415);
    expect(await storedKeys()).toEqual([]);
  });

  it("accepts an empty body as an empty file", async () => {
    const driveId = await seedDrive(db.admin, {
      owner: { userId: anna, familyId: null },
      name: "Personal",
    });

    const response = await upload(driveId, "", { "x-offgrid-file-name": "Empty.txt" });

    expect(response.statusCode).toBe(201);
    expect(response.json()).toMatchObject({ size: 0 });
  });

  it("answers 404 for a person outside the family and stores no bytes", async () => {
    const driveId = await seedDrive(db.admin, {
      owner: { userId: null, familyId },
      name: "The Smiths",
    });

    const response = await upload(
      driveId,
      "secret",
      { "x-offgrid-file-name": "Secret.txt" },
      { "x-user-id": ben },
    );

    expect(response.statusCode).toBe(404);
    expect(response.json()).toMatchObject({ code: "NOT_FOUND" });
    expect(await storedKeys()).toEqual([]);
  });

  it("answers 401 without a signed-in person", async () => {
    const driveId = await seedDrive(db.admin, {
      owner: { userId: anna, familyId: null },
      name: "Personal",
    });

    const response = await upload(driveId, "x", { "x-offgrid-file-name": "A.txt" }, {});

    expect(response.statusCode).toBe(401);
  });

  it("answers 400 when the name header is missing or malformed", async () => {
    const driveId = await seedDrive(db.admin, {
      owner: { userId: anna, familyId: null },
      name: "Personal",
    });

    const missing = await upload(driveId, "x", {});
    const badEncoding = await upload(driveId, "x", { "x-offgrid-file-name": "%E0%A4%A" });
    const slashInName = await upload(driveId, "x", { "x-offgrid-file-name": "a%2Fb.txt" });

    expect(missing.statusCode).toBe(400);
    expect(badEncoding.statusCode).toBe(400);
    expect(badEncoding.json()).toMatchObject({ code: "VALIDATION_FAILED" });
    expect(slashInName.statusCode).toBe(400);
  });

  it("answers 400 for a malformed parent id", async () => {
    const driveId = await seedDrive(db.admin, {
      owner: { userId: anna, familyId: null },
      name: "Personal",
    });

    const response = await upload(driveId, "x", {
      "x-offgrid-file-name": "A.txt",
      "x-offgrid-parent-id": "not-a-uuid",
    });

    expect(response.statusCode).toBe(400);
    expect(await storedKeys()).toEqual([]);
  });

  it("answers 413 from the declared length before reading the body", async () => {
    const driveId = await seedDrive(db.admin, {
      owner: { userId: anna, familyId: null },
      name: "Personal",
    });
    const oversized = "x".repeat(DEFAULT_TEST_MAX_UPLOAD_BYTES + 1);

    const response = await upload(driveId, oversized, {
      "x-offgrid-file-name": "Big.txt",
      "content-length": String(oversized.length),
    });

    expect(response.statusCode).toBe(413);
    expect(response.json()).toMatchObject({ code: "PAYLOAD_TOO_LARGE" });
    expect(await storedKeys()).toEqual([]);
    expect(await countFiles()).toBe(0);
  });

  it("answers 413 for a streamed body that grows past the limit, and keeps no bytes or rows", async () => {
    const driveId = await seedDrive(db.admin, {
      owner: { userId: anna, familyId: null },
      name: "Personal",
    });
    const oversized = Readable.from([Buffer.alloc(DEFAULT_TEST_MAX_UPLOAD_BYTES), Buffer.alloc(1)]);

    const response = await upload(driveId, oversized, { "x-offgrid-file-name": "Big.txt" });

    expect(response.statusCode).toBe(413);
    expect(response.json()).toMatchObject({ code: "PAYLOAD_TOO_LARGE" });
    expect(await storedKeys()).toEqual([]);
    expect(await countFiles()).toBe(0);
  });

  it("answers 409 for a taken name and stores no bytes for the second upload", async () => {
    const driveId = await seedDrive(db.admin, {
      owner: { userId: anna, familyId: null },
      name: "Personal",
    });
    await upload(driveId, "first", { "x-offgrid-file-name": "Holiday.txt" });

    const response = await upload(driveId, "second", { "x-offgrid-file-name": "holiday.txt" });

    expect(response.statusCode).toBe(409);
    expect(response.json()).toMatchObject({ code: "NAME_TAKEN" });
    expect(await storedKeys()).toHaveLength(1);
    expect(await countFiles()).toBe(1);
  });

  it("keeps the JSON body parser on the folder route", async () => {
    const driveId = await seedDrive(db.admin, {
      owner: { userId: anna, familyId: null },
      name: "Personal",
    });

    const response = await app.inject({
      method: "POST",
      url: `/drives/${driveId}/folders`,
      headers: annaHeaders,
      payload: { parentId: null, name: "Holiday" },
    });

    expect(response.statusCode).toBe(201);
  });
});
