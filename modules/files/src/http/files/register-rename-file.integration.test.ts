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

describe("PATCH /files/:id", { timeout: 60_000 }, () => {
  let db: FilesTestDatabase;
  let app: FastifyInstance;
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
  });

  afterEach(async () => {
    await app.close();
  });

  const patch = (fileId: string, payload: unknown, headers: Record<string, string> = annaHeaders) =>
    app.inject({
      method: "PATCH",
      url: `/files/${fileId}`,
      headers,
      payload: payload as Record<string, unknown>,
    });

  it("answers 200 with the renamed folder", async () => {
    const driveId = await seedDrive(db.admin, {
      owner: { userId: anna, familyId: null },
      name: "Personal",
    });
    const holiday = await seedFolder(db.admin, {
      driveId,
      owner: { userId: anna, familyId: null },
      parentId: null,
      name: "Holiday",
    });

    const response = await patch(holiday, { name: "Summer" });

    expect(response.statusCode).toBe(200);
    expect(fileSchema.parse(response.json())).toMatchObject({
      id: holiday,
      name: "Summer",
      version: 2,
    });
  });

  it("answers 409 NAME_TAKEN with a fixed message", async () => {
    const driveId = await seedDrive(db.admin, {
      owner: { userId: anna, familyId: null },
      name: "Personal",
    });
    const holiday = await seedFolder(db.admin, {
      driveId,
      owner: { userId: anna, familyId: null },
      parentId: null,
      name: "Holiday",
    });
    await seedFolder(db.admin, {
      driveId,
      owner: { userId: anna, familyId: null },
      parentId: null,
      name: "Work",
    });

    const response = await patch(holiday, { name: "work" });

    expect(response.statusCode).toBe(409);
    expect(response.json()).toEqual({
      code: "NAME_TAKEN",
      message: "A file or folder with this name already exists here.",
    });
  });

  it("answers 404 for a file the person cannot see", async () => {
    const otherFamily = { userId: null, familyId: randomUUID() };
    const driveId = await seedDrive(db.admin, {
      owner: otherFamily,
      name: "Other",
    });
    const folder = await seedFolder(db.admin, {
      driveId,
      owner: otherFamily,
      parentId: null,
      name: "Holiday",
    });

    const response = await patch(folder, { name: "Summer" });

    expect(response.statusCode).toBe(404);
  });

  it("answers 400 for a name with a slash", async () => {
    const response = await patch(randomUUID(), { name: "a/b" });

    expect(response.statusCode).toBe(400);
    expect(response.json()).toMatchObject({ code: "VALIDATION_FAILED" });
  });

  it("answers 401 without a user", async () => {
    const response = await patch(randomUUID(), { name: "Summer" }, {});

    expect(response.statusCode).toBe(401);
  });
});
