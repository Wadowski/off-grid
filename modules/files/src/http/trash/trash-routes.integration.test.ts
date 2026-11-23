// SPDX-FileCopyrightText: 2026 Dominik Wadowski
// SPDX-License-Identifier: FSL-1.1-ALv2

import { randomUUID } from "node:crypto";
import { fileListSchema, fileSchema } from "@offgrid/contracts";
import type { FastifyInstance } from "fastify";
import { afterAll, afterEach, beforeAll, beforeEach, describe, expect, it } from "vitest";
import { createFilesTestApp } from "../../../test/create-files-test-app.js";
import { seedDrive } from "../../../test/seed-drive.js";
import { seedFolder } from "../../../test/seed-folder.js";
import { seedRegularFile } from "../../../test/seed-regular-file.js";
import { startFilesTestDatabase } from "../../../test/start-files-test-database.js";
import type { FilesTestDatabase } from "../../../test/types.js";

describe("trash routes", { timeout: 60_000 }, () => {
  let db: FilesTestDatabase;
  let app: FastifyInstance;
  const anna = randomUUID();
  const ben = randomUUID();
  const annaHeaders = { "x-user-id": anna };
  const annaOwner = { userId: anna, familyId: null };

  beforeAll(async () => {
    db = await startFilesTestDatabase();
  }, 120_000);

  afterAll(async () => {
    await db.stop();
  }, 120_000);

  beforeEach(async () => {
    await db.reset();
    await db.admin.query("TRUNCATE outbox.event, outbox.subscriber_cursor, outbox.dead_letter");
    app = await createFilesTestApp(db);
  });

  afterEach(async () => {
    await app.close();
  });

  it("POST /files/:id/trash answers 200 with the entry and 404 when it is trashed already", async () => {
    const driveId = await seedDrive(db.admin, { owner: annaOwner, name: "Personal" });
    const fileId = await seedRegularFile(db.admin, {
      driveId,
      owner: annaOwner,
      parentId: null,
      name: "a.txt",
      sizeBytes: 1,
      createdByUserId: anna,
    });

    const first = await app.inject({
      method: "POST",
      url: `/files/${fileId}/trash`,
      headers: annaHeaders,
    });
    const second = await app.inject({
      method: "POST",
      url: `/files/${fileId}/trash`,
      headers: annaHeaders,
    });

    expect(first.statusCode).toBe(200);
    expect(fileSchema.safeParse(first.json()).success).toBe(true);
    expect(second.statusCode).toBe(404);
  });

  it("POST /files/:id/restore answers 409 NOT_TRASHED for a live file", async () => {
    const driveId = await seedDrive(db.admin, { owner: annaOwner, name: "Personal" });
    const fileId = await seedRegularFile(db.admin, {
      driveId,
      owner: annaOwner,
      parentId: null,
      name: "a.txt",
      sizeBytes: 1,
      createdByUserId: anna,
    });

    const response = await app.inject({
      method: "POST",
      url: `/files/${fileId}/restore`,
      headers: annaHeaders,
    });

    expect(response.statusCode).toBe(409);
    expect(response.json()).toMatchObject({ code: "NOT_TRASHED" });
  });

  it("DELETE /files/:id answers 204 for a trashed folder and 404 for a non-member", async () => {
    const driveId = await seedDrive(db.admin, { owner: annaOwner, name: "Personal" });
    const folderId = await seedFolder(db.admin, {
      driveId,
      owner: annaOwner,
      parentId: null,
      name: "Old",
      trashed: true,
    });

    const stranger = await app.inject({
      method: "DELETE",
      url: `/files/${folderId}`,
      headers: { "x-user-id": ben },
    });
    const owner = await app.inject({
      method: "DELETE",
      url: `/files/${folderId}`,
      headers: annaHeaders,
    });

    expect(stranger.statusCode).toBe(404);
    expect(owner.statusCode).toBe(204);
  });

  it("GET /drives/:id/trash lists trashed rows and matches the file list schema", async () => {
    const driveId = await seedDrive(db.admin, { owner: annaOwner, name: "Personal" });
    await seedFolder(db.admin, {
      driveId,
      owner: annaOwner,
      parentId: null,
      name: "Old",
      trashed: true,
    });

    const response = await app.inject({
      method: "GET",
      url: `/drives/${driveId}/trash`,
      headers: annaHeaders,
    });

    expect(response.statusCode).toBe(200);
    expect(fileListSchema.safeParse(response.json()).success).toBe(true);
    expect(response.json().items.map((item: { name: string }) => item.name)).toEqual(["Old"]);
  });

  it("DELETE /drives/:id/trash answers 204, and 404 for a drive the caller cannot see", async () => {
    const driveId = await seedDrive(db.admin, { owner: annaOwner, name: "Personal" });
    await seedFolder(db.admin, {
      driveId,
      owner: annaOwner,
      parentId: null,
      name: "Old",
      trashed: true,
    });

    const hidden = await app.inject({
      method: "DELETE",
      url: `/drives/${driveId}/trash`,
      headers: { "x-user-id": ben },
    });
    const empty = await app.inject({
      method: "DELETE",
      url: `/drives/${driveId}/trash`,
      headers: annaHeaders,
    });

    expect(hidden.statusCode).toBe(404);
    expect(empty.statusCode).toBe(204);
  });

  it("answers 401 without a user", async () => {
    const response = await app.inject({ method: "GET", url: `/drives/${randomUUID()}/trash` });

    expect(response.statusCode).toBe(401);
  });
});
