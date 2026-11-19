// SPDX-FileCopyrightText: 2026 Dominik Wadowski
// SPDX-License-Identifier: FSL-1.1-ALv2

import { randomUUID } from "node:crypto";
import { driveListSchema, fileDetailsSchema, fileListSchema } from "@offgrid/contracts";
import type { FastifyInstance } from "fastify";
import { afterAll, afterEach, beforeAll, beforeEach, describe, expect, it } from "vitest";
import { createFilesTestApp } from "../../../test/create-files-test-app.js";
import { seedDrive } from "../../../test/seed-drive.js";
import { seedFolder } from "../../../test/seed-folder.js";
import { seedRegularFile } from "../../../test/seed-regular-file.js";
import { startFilesTestDatabase } from "../../../test/start-files-test-database.js";
import type { FilesTestDatabase } from "../../../test/types.js";

describe("files routes", { timeout: 60_000 }, () => {
  let db: FilesTestDatabase;
  let app: FastifyInstance;
  const familyA = randomUUID();
  const familyB = randomUUID();
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
    app = await createFilesTestApp(db);
    await db.admin.query(
      `INSERT INTO files.family_membership (family_id, user_id, source_version, is_member) VALUES
         ($1, $2, 1, true), ($3, $4, 1, true)`,
      [familyA, anna, familyB, ben],
    );
  });

  afterEach(async () => {
    await app.close();
  });

  const assertNoHiddenFields = (body: string) => {
    expect(body).not.toContain("storageKey");
    expect(body).not.toContain("storage_key");
    expect(body).not.toContain("sha256");
  };

  it("lists the drives Anna may see and no one else's", async () => {
    const annaPersonal = await seedDrive(db.admin, {
      owner: { userId: anna, familyId: null },
      name: "Personal",
    });
    await seedDrive(db.admin, { owner: { userId: null, familyId: familyB }, name: "Other" });

    const response = await app.inject({ method: "GET", url: "/drives", headers: annaHeaders });

    expect(response.statusCode).toBe(200);
    const body = driveListSchema.parse(response.json());
    expect(body.drives.map((drive) => drive.id)).toEqual([annaPersonal]);
    assertNoHiddenFields(response.body);
  });

  it("answers 401 for a request without a signed-in user", async () => {
    const response = await app.inject({ method: "GET", url: "/drives" });

    expect(response.statusCode).toBe(401);
  });

  it("lists a folder's children with breadcrumbs and a next cursor", async () => {
    const driveId = await seedDrive(db.admin, {
      owner: { userId: anna, familyId: null },
      name: "Personal",
    });
    const folder = await seedFolder(db.admin, {
      driveId,
      owner: { userId: anna, familyId: null },
      parentId: null,
      name: "Photos",
    });
    for (const name of ["a.jpg", "b.jpg"]) {
      await seedRegularFile(db.admin, {
        driveId,
        owner: { userId: anna, familyId: null },
        parentId: folder,
        name,
        sizeBytes: 5,
        createdByUserId: anna,
      });
    }

    const response = await app.inject({
      method: "GET",
      url: `/files/${folder}/children?limit=1`,
      headers: annaHeaders,
    });

    expect(response.statusCode).toBe(200);
    const body = fileListSchema.parse(response.json());
    expect(body.items.map((item) => item.name)).toEqual(["a.jpg"]);
    expect(body.breadcrumbs).toEqual([
      { kind: "drive", id: driveId, name: "Personal" },
      { kind: "folder", id: folder, name: "Photos" },
    ]);
    expect(body.nextCursor).not.toBeNull();
    assertNoHiddenFields(response.body);
  });

  it("returns the details of a file with its breadcrumbs", async () => {
    const driveId = await seedDrive(db.admin, {
      owner: { userId: anna, familyId: null },
      name: "Personal",
    });
    const file = await seedRegularFile(db.admin, {
      driveId,
      owner: { userId: anna, familyId: null },
      parentId: null,
      name: "policy.pdf",
      sizeBytes: 2048,
      createdByUserId: anna,
    });

    const response = await app.inject({
      method: "GET",
      url: `/files/${file}`,
      headers: annaHeaders,
    });

    expect(response.statusCode).toBe(200);
    const body = fileDetailsSchema.parse(response.json());
    expect(body.file).toMatchObject({ id: file, name: "policy.pdf", isFolder: false, size: 2048 });
    expect(body.breadcrumbs).toEqual([{ kind: "drive", id: driveId, name: "Personal" }]);
    assertNoHiddenFields(response.body);
  });

  it("answers 404 for another family's drive, folder and file", async () => {
    const familyDrive = await seedDrive(db.admin, {
      owner: { userId: null, familyId: familyB },
      name: "Other",
    });
    const folder = await seedFolder(db.admin, {
      driveId: familyDrive,
      owner: { userId: null, familyId: familyB },
      parentId: null,
      name: "Private",
    });
    const file = await seedRegularFile(db.admin, {
      driveId: familyDrive,
      owner: { userId: null, familyId: familyB },
      parentId: folder,
      name: "secret.txt",
      sizeBytes: 1,
      createdByUserId: ben,
    });

    const urls = [`/drives/${familyDrive}/children`, `/files/${folder}/children`, `/files/${file}`];
    for (const url of urls) {
      const response = await app.inject({ method: "GET", url, headers: annaHeaders });
      expect(response.statusCode, url).toBe(404);
    }
  });

  it("answers 404 for a trashed file", async () => {
    const driveId = await seedDrive(db.admin, {
      owner: { userId: anna, familyId: null },
      name: "Personal",
    });
    const file = await seedRegularFile(db.admin, {
      driveId,
      owner: { userId: anna, familyId: null },
      parentId: null,
      name: "old.pdf",
      sizeBytes: 1,
      createdByUserId: anna,
      trashed: true,
    });

    const response = await app.inject({
      method: "GET",
      url: `/files/${file}`,
      headers: annaHeaders,
    });

    expect(response.statusCode).toBe(404);
  });

  it("answers 400 for a malformed id, limit or cursor", async () => {
    const driveId = await seedDrive(db.admin, {
      owner: { userId: anna, familyId: null },
      name: "Personal",
    });
    const urls = [
      "/drives/not-a-uuid/children",
      `/drives/${driveId}/children?limit=0`,
      `/drives/${driveId}/children?limit=500`,
      `/drives/${driveId}/children?cursor=%25%25garbage`,
    ];
    for (const url of urls) {
      const response = await app.inject({ method: "GET", url, headers: annaHeaders });
      expect(response.statusCode, url).toBe(400);
    }
  });
});
