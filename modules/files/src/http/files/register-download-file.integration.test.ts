// SPDX-FileCopyrightText: 2026 Dominik Wadowski
// SPDX-License-Identifier: FSL-1.1-ALv2

import { randomUUID } from "node:crypto";
import { Readable } from "node:stream";
import { allocateStorageKey, createInMemoryFileStorage } from "@offgrid/file-storage";
import type { FileStorage } from "@offgrid/file-storage";
import type { FastifyInstance } from "fastify";
import { afterAll, afterEach, beforeAll, beforeEach, describe, expect, it } from "vitest";
import { createFilesTestApp } from "../../../test/create-files-test-app.js";
import { DEFAULT_TEST_MAX_UPLOAD_BYTES } from "../../../test/constants.js";
import { seedDrive } from "../../../test/seed-drive.js";
import { seedFolder } from "../../../test/seed-folder.js";
import { seedRegularFile } from "../../../test/seed-regular-file.js";
import { startFilesTestDatabase } from "../../../test/start-files-test-database.js";
import type { FilesTestDatabase } from "../../../test/types.js";
import { uploadFile } from "../../application/files/upload-file.js";

const PNG_BYTES = Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x00, 0xff, 0x0d, 0x0a]);

describe("GET /files/:id/content", { timeout: 60_000 }, () => {
  let db: FilesTestDatabase;
  let app: FastifyInstance;
  let storage: FileStorage;
  const anna = randomUUID();
  const ben = randomUUID();
  let driveId: string;
  let notesId: string;
  let pngId: string;
  let htmlId: string;
  let pdfId: string;
  let emptyId: string;
  let folderId: string;

  beforeAll(async () => {
    db = await startFilesTestDatabase();
  }, 120_000);

  afterAll(async () => {
    await db.stop();
  }, 120_000);

  const uploadAs = async (name: string, mimeType: string, bytes: Buffer): Promise<string> => {
    const outcome = await uploadFile(
      { db: db.db, storage, maxUploadBytes: DEFAULT_TEST_MAX_UPLOAD_BYTES },
      anna,
      {
        driveId,
        parentId: null,
        name,
        mimeType,
        body: Readable.from([bytes]),
        signal: new AbortController().signal,
      },
    );
    if (outcome.outcome !== "found") {
      throw new Error(`${name} could not be uploaded`);
    }
    return outcome.value.fileId;
  };

  const download = (url: string, headers: Record<string, string> = {}, userId = anna) =>
    app.inject({ method: "GET", url, headers: { "x-user-id": userId, ...headers } });

  beforeEach(async () => {
    await db.reset();
    storage = createInMemoryFileStorage();
    app = await createFilesTestApp(db, { storage, maxUploadBytes: DEFAULT_TEST_MAX_UPLOAD_BYTES });
    driveId = await seedDrive(db.admin, {
      owner: { userId: anna, familyId: null },
      name: "Personal",
    });
    notesId = await uploadAs("Notes.txt", "text/plain", Buffer.from("first draft"));
    pngId = await uploadAs("photo.png", "image/png", PNG_BYTES);
    htmlId = await uploadAs("page.html", "text/html", Buffer.from("<p>hi</p>"));
    pdfId = await uploadAs("Guide.pdf", "application/pdf", Buffer.from("%PDF-1.7"));
    emptyId = await uploadAs("empty.txt", "text/plain", Buffer.alloc(0));
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

  it("answers 200 with the exact bytes and the safe headers", async () => {
    const response = await download(`/files/${notesId}/content`);

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
    expect(response.headers).not.toHaveProperty("content-range");
    expect(response.headers).not.toHaveProperty("content-security-policy");
  });

  it("returns non-UTF-8 bytes unchanged", async () => {
    const response = await download(`/files/${pngId}/content`);

    expect(response.rawPayload.equals(PNG_BYTES)).toBe(true);
  });

  it("answers 200 with an empty body for an empty file", async () => {
    const response = await download(`/files/${emptyId}/content`);

    expect(response.statusCode).toBe(200);
    expect(response.rawPayload.length).toBe(0);
    expect(response.headers["content-length"]).toBe("0");
  });

  it.each([
    ["bytes=1-3", "irs", "bytes 1-3/11", "3"],
    ["bytes=6-", "draft", "bytes 6-10/11", "5"],
    ["bytes=-4", "raft", "bytes 7-10/11", "4"],
  ])("answers 206 for %s with the right bytes", async (range, body, contentRange, length) => {
    const response = await download(`/files/${notesId}/content`, { range });

    expect(response.statusCode).toBe(206);
    expect(response.body).toBe(body);
    expect(response.headers).toMatchObject({
      "content-range": contentRange,
      "content-length": length,
      "accept-ranges": "bytes",
    });
  });

  it("answers 416 with the file size for a range past the end", async () => {
    const response = await download(`/files/${notesId}/content`, { range: "bytes=50-60" });

    expect(response.statusCode).toBe(416);
    expect(response.headers["content-range"]).toBe("bytes */11");
    expect(response.json()).toMatchObject({ code: "RANGE_NOT_SATISFIABLE" });
  });

  it("ignores a malformed Range header and answers with the whole file", async () => {
    const response = await download(`/files/${notesId}/content`, { range: "items=1-2" });

    expect(response.statusCode).toBe(200);
    expect(response.body).toBe("first draft");
    expect(response.headers).not.toHaveProperty("content-range");
  });

  it("ignores a multi-range header and answers with the whole file", async () => {
    const response = await download(`/files/${notesId}/content`, { range: "bytes=0-1,3-4" });

    expect(response.statusCode).toBe(200);
    expect(response.body).toBe("first draft");
  });

  it("shows an image inline when asked, with a sandboxing policy", async () => {
    const response = await download(`/files/${pngId}/content?disposition=inline`);

    expect(response.statusCode).toBe(200);
    expect(response.headers).toMatchObject({
      "content-type": "image/png",
      "content-disposition": "inline; filename=\"photo.png\"; filename*=UTF-8''photo.png",
      "content-security-policy": "default-src 'none'; sandbox",
    });
  });

  it("shows a PDF inline when asked, with the viewer policy", async () => {
    const response = await download(`/files/${pdfId}/content?disposition=inline`);

    expect(response.headers).toMatchObject({
      "content-type": "application/pdf",
      "content-security-policy": "default-src 'none'; object-src 'self'; frame-ancestors 'self'",
    });
  });

  it("keeps an HTML file as an attachment even when inline is asked", async () => {
    const response = await download(`/files/${htmlId}/content?disposition=inline`);

    expect(response.headers).toMatchObject({
      "content-type": "application/octet-stream",
      "content-disposition": "attachment; filename=\"page.html\"; filename*=UTF-8''page.html",
    });
    expect(response.headers).not.toHaveProperty("content-security-policy");
  });

  it("answers 400 for an unknown disposition", async () => {
    const response = await download(`/files/${notesId}/content?disposition=other`);

    expect(response.statusCode).toBe(400);
    expect(response.json()).toMatchObject({ code: "VALIDATION_FAILED" });
  });

  it("answers 400 IS_FOLDER for a folder", async () => {
    const response = await download(`/files/${folderId}/content`);

    expect(response.statusCode).toBe(400);
    expect(response.json()).toMatchObject({ code: "IS_FOLDER" });
  });

  it("answers 404 for a person who cannot see the file", async () => {
    const response = await download(`/files/${notesId}/content`, {}, ben);

    expect(response.statusCode).toBe(404);
    expect(response.json()).toMatchObject({ code: "NOT_FOUND" });
  });

  it("answers 404 for a trashed file", async () => {
    const trashedId = await seedRegularFile(db.admin, {
      driveId,
      owner: { userId: anna, familyId: null },
      parentId: null,
      name: "Gone.txt",
      sizeBytes: 0,
      createdByUserId: anna,
      trashed: true,
    });

    const response = await download(`/files/${trashedId}/content`);

    expect(response.statusCode).toBe(404);
  });

  it("answers 404 when the stored bytes are missing and does not name the file in the body", async () => {
    const lostId = await seedRegularFile(db.admin, {
      driveId,
      owner: { userId: anna, familyId: null },
      parentId: null,
      name: "Lost.txt",
      sizeBytes: 4,
      createdByUserId: anna,
      storageKey: await allocateStorageKey(async () => false),
    });

    const response = await download(`/files/${lostId}/content`);

    expect(response.statusCode).toBe(404);
    expect(response.body).not.toContain("Lost.txt");
  });

  it("answers 400 for an id that is not valid", async () => {
    const response = await download("/files/not-an-id/content");

    expect(response.statusCode).toBe(400);
    expect(response.json()).toMatchObject({ code: "VALIDATION_FAILED" });
  });

  it("answers 401 without a signed-in person", async () => {
    const response = await app.inject({ method: "GET", url: `/files/${notesId}/content` });

    expect(response.statusCode).toBe(401);
  });
});
