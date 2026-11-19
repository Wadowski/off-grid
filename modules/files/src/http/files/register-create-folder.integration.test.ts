// SPDX-FileCopyrightText: 2026 Dominik Wadowski
// SPDX-License-Identifier: FSL-1.1-ALv2

import { randomUUID } from "node:crypto";
import { fileSchema } from "@offgrid/contracts";
import type { FastifyInstance } from "fastify";
import { afterAll, afterEach, beforeAll, beforeEach, describe, expect, it } from "vitest";
import { createFilesTestApp } from "../../../test/create-files-test-app.js";
import { seedDrive } from "../../../test/seed-drive.js";
import { seedFolder } from "../../../test/seed-folder.js";
import { startFilesTestDatabase } from "../../../test/start-files-test-database.js";
import type { FilesTestDatabase } from "../../../test/types.js";

describe("POST /drives/:id/folders", { timeout: 60_000 }, () => {
  let db: FilesTestDatabase;
  let app: FastifyInstance;
  const familyId = randomUUID();
  const anna = randomUUID();
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
    app = await createFilesTestApp(db);
    await db.admin.query(
      "INSERT INTO files.family_membership (family_id, user_id, source_version, is_member) VALUES ($1, $2, 1, true)",
      [familyId, anna],
    );
  });

  afterEach(async () => {
    await app.close();
  });

  const post = (driveId: string, payload: unknown, headers: Record<string, string> = annaHeaders) =>
    app.inject({
      method: "POST",
      url: `/drives/${driveId}/folders`,
      headers,
      payload: payload as Record<string, unknown>,
    });

  it("answers 201 with the new folder", async () => {
    const driveId = await seedDrive(db.admin, {
      owner: { userId: anna, familyId: null },
      name: "Personal",
    });

    const response = await post(driveId, { parentId: null, name: "Holiday" });

    expect(response.statusCode).toBe(201);
    expect(fileSchema.parse(response.json())).toMatchObject({
      name: "Holiday",
      isFolder: true,
      version: 1,
      parentId: null,
      driveId,
    });
    expect(response.body).not.toContain("storage");
  });

  it("answers 201 inside a folder of the family drive", async () => {
    const driveId = await seedDrive(db.admin, {
      owner: { userId: null, familyId },
      name: "The Smiths",
    });
    const holiday = await seedFolder(db.admin, {
      driveId,
      owner: { userId: null, familyId },
      parentId: null,
      name: "Holiday",
    });

    const response = await post(driveId, { parentId: holiday, name: "Beach" });

    expect(response.statusCode).toBe(201);
    expect(response.json()).toMatchObject({ parentId: holiday, name: "Beach" });
  });

  it("answers 409 NAME_TAKEN for a duplicate name with a fixed message", async () => {
    const driveId = await seedDrive(db.admin, {
      owner: { userId: anna, familyId: null },
      name: "Personal",
    });
    await seedFolder(db.admin, {
      driveId,
      owner: { userId: anna, familyId: null },
      parentId: null,
      name: "Holiday",
    });

    const response = await post(driveId, { parentId: null, name: "holiday" });

    expect(response.statusCode).toBe(409);
    expect(response.json()).toEqual({
      code: "NAME_TAKEN",
      message: "A file or folder with this name already exists here.",
    });
  });

  it("answers 404 for a drive the person cannot see, without naming it", async () => {
    const driveId = await seedDrive(db.admin, {
      owner: { userId: null, familyId: randomUUID() },
      name: "Other",
    });

    const response = await post(driveId, { parentId: null, name: "Holiday" });

    expect(response.statusCode).toBe(404);
    expect(response.json()).toEqual({
      code: "NOT_FOUND",
      message: "The requested resource was not found",
    });
  });

  it("answers 400 for a name that breaks the name rules", async () => {
    const driveId = await seedDrive(db.admin, {
      owner: { userId: anna, familyId: null },
      name: "Personal",
    });

    const response = await post(driveId, { parentId: null, name: "a/b" });

    expect(response.statusCode).toBe(400);
    expect(response.json()).toMatchObject({ code: "VALIDATION_FAILED" });
  });

  it("answers 400 for a malformed drive id", async () => {
    const response = await post("not-a-uuid", { parentId: null, name: "Holiday" });

    expect(response.statusCode).toBe(400);
  });

  it("answers 401 without a user", async () => {
    const driveId = randomUUID();

    const response = await post(driveId, { parentId: null, name: "Holiday" }, {});

    expect(response.statusCode).toBe(401);
  });
});
