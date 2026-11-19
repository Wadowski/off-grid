// SPDX-FileCopyrightText: 2026 Dominik Wadowski
// SPDX-License-Identifier: FSL-1.1-ALv2

import { randomUUID } from "node:crypto";
import { moveFileResultSchema } from "@offgrid/contracts";
import type { FastifyInstance } from "fastify";
import { afterAll, afterEach, beforeAll, beforeEach, describe, expect, it } from "vitest";
import { createFilesTestApp } from "../../../test/create-files-test-app.js";
import { seedDrive } from "../../../test/seed-drive.js";
import { seedFolder } from "../../../test/seed-folder.js";
import { startFilesTestDatabase } from "../../../test/start-files-test-database.js";
import type { FilesTestDatabase } from "../../../test/types.js";

describe("POST /files/:id/move", { timeout: 60_000 }, () => {
  let db: FilesTestDatabase;
  let app: FastifyInstance;
  const anna = randomUUID();
  const annaOwner = { userId: anna, familyId: null };
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

  const move = (fileId: string, payload: unknown, headers: Record<string, string> = annaHeaders) =>
    app.inject({
      method: "POST",
      url: `/files/${fileId}/move`,
      headers,
      payload: payload as Record<string, unknown>,
    });

  it("answers 200 with the moved folder and no cross-owner notice", async () => {
    const driveId = await seedDrive(db.admin, { owner: annaOwner, name: "Personal" });
    const holiday = await seedFolder(db.admin, {
      driveId,
      owner: annaOwner,
      parentId: null,
      name: "Holiday",
    });
    const photos = await seedFolder(db.admin, {
      driveId,
      owner: annaOwner,
      parentId: null,
      name: "Photos",
    });

    const response = await move(holiday, { driveId, parentId: photos });

    expect(response.statusCode).toBe(200);
    expect(moveFileResultSchema.parse(response.json())).toMatchObject({
      crossOwnerNotice: false,
      file: { id: holiday, parentId: photos, version: 2 },
    });
  });

  it("answers 200 with the cross-owner notice when a folder moves to a family drive", async () => {
    const personal = await seedDrive(db.admin, { owner: annaOwner, name: "Personal" });
    const familyOwner = { userId: null, familyId: randomUUID() };
    await db.admin.query(
      "INSERT INTO files.family_membership (family_id, user_id, source_version, is_member) VALUES ($1, $2, 1, true)",
      [familyOwner.familyId, anna],
    );
    const family = await seedDrive(db.admin, { owner: familyOwner, name: "The Smiths" });
    const holiday = await seedFolder(db.admin, {
      driveId: personal,
      owner: annaOwner,
      parentId: null,
      name: "Holiday",
    });

    const response = await move(holiday, { driveId: family, parentId: null });

    expect(response.statusCode).toBe(200);
    expect(moveFileResultSchema.parse(response.json())).toMatchObject({
      crossOwnerNotice: true,
      file: { name: "Holiday", parentId: null, version: 1, driveId: family },
    });
  });

  it("answers 409 INVALID_MOVE for a move into itself", async () => {
    const driveId = await seedDrive(db.admin, { owner: annaOwner, name: "Personal" });
    const holiday = await seedFolder(db.admin, {
      driveId,
      owner: annaOwner,
      parentId: null,
      name: "Holiday",
    });

    const response = await move(holiday, { driveId, parentId: holiday });

    expect(response.statusCode).toBe(409);
    expect(response.json()).toMatchObject({ code: "INVALID_MOVE" });
  });

  it("answers 409 NAME_TAKEN when the target folder has the name", async () => {
    const driveId = await seedDrive(db.admin, { owner: annaOwner, name: "Personal" });
    const holiday = await seedFolder(db.admin, {
      driveId,
      owner: annaOwner,
      parentId: null,
      name: "Holiday",
    });
    const photos = await seedFolder(db.admin, {
      driveId,
      owner: annaOwner,
      parentId: null,
      name: "Photos",
    });
    await seedFolder(db.admin, { driveId, owner: annaOwner, parentId: photos, name: "Holiday" });

    const response = await move(holiday, { driveId, parentId: photos });

    expect(response.statusCode).toBe(409);
    expect(response.json()).toMatchObject({ code: "NAME_TAKEN" });
  });

  it("answers 404 for a target drive the person cannot see", async () => {
    const driveId = await seedDrive(db.admin, { owner: annaOwner, name: "Personal" });
    const holiday = await seedFolder(db.admin, {
      driveId,
      owner: annaOwner,
      parentId: null,
      name: "Holiday",
    });

    const response = await move(holiday, { driveId: randomUUID(), parentId: null });

    expect(response.statusCode).toBe(404);
  });

  it("answers 400 for a malformed body and 401 without a user", async () => {
    const response = await move(randomUUID(), { driveId: "nope", parentId: null });
    const unauthenticated = await move(randomUUID(), { driveId: randomUUID(), parentId: null }, {});

    expect(response.statusCode).toBe(400);
    expect(unauthenticated.statusCode).toBe(401);
  });
});
