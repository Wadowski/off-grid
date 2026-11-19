// SPDX-FileCopyrightText: 2026 Dominik Wadowski
// SPDX-License-Identifier: FSL-1.1-ALv2

import { randomUUID } from "node:crypto";
import { afterAll, beforeAll, beforeEach, describe, expect, it } from "vitest";
import { startFilesTestDatabase } from "../../../test/start-files-test-database.js";
import { seedDrive } from "../../../test/seed-drive.js";
import { seedFolder } from "../../../test/seed-folder.js";
import { seedRegularFile } from "../../../test/seed-regular-file.js";
import type { FilesTestDatabase, SeedOwner } from "../../../test/types.js";
import { getFileDetails } from "./get-file-details.js";

describe("getFileDetails", { timeout: 60_000 }, () => {
  let db: FilesTestDatabase;
  const familyA = randomUUID();
  const familyB = randomUUID();
  const anna = randomUUID();
  const ben = randomUUID();
  const annaOwner: SeedOwner = { userId: anna, familyId: null };
  const benOwner: SeedOwner = { userId: ben, familyId: null };
  const familyBOwner: SeedOwner = { userId: null, familyId: familyB };

  beforeAll(async () => {
    db = await startFilesTestDatabase();
  }, 120_000);

  afterAll(async () => {
    await db.stop();
  }, 120_000);

  beforeEach(async () => {
    await db.reset();
    await db.admin.query(
      `INSERT INTO files.family_membership (family_id, user_id, source_version, is_member) VALUES
         ($1, $2, 1, true), ($3, $4, 1, true)`,
      [familyA, anna, familyB, ben],
    );
  });

  it("gives a file in three nested folders the path to it, without the file itself", async () => {
    const driveId = await seedDrive(db.admin, { owner: annaOwner, name: "Personal" });
    const holiday = await seedFolder(db.admin, {
      driveId,
      owner: annaOwner,
      parentId: null,
      name: "Holiday",
    });
    const beach = await seedFolder(db.admin, {
      driveId,
      owner: annaOwner,
      parentId: holiday,
      name: "Beach",
    });
    const day = await seedFolder(db.admin, {
      driveId,
      owner: annaOwner,
      parentId: beach,
      name: "Day 1",
    });
    const file = await seedRegularFile(db.admin, {
      driveId,
      owner: annaOwner,
      parentId: day,
      name: "sunset.jpg",
      sizeBytes: 9,
      createdByUserId: anna,
    });

    const result = await getFileDetails(db.db, anna, file);

    expect(result.outcome).toBe("found");
    if (result.outcome !== "found") {
      return;
    }
    expect(result.value.file.fileId).toBe(file);
    expect(result.value.breadcrumbs).toEqual([
      { kind: "drive", id: driveId, name: "Personal" },
      { kind: "folder", id: holiday, name: "Holiday" },
      { kind: "folder", id: beach, name: "Beach" },
      { kind: "folder", id: day, name: "Day 1" },
    ]);
  });

  it("gives only the drive crumb for a file at the drive root", async () => {
    const driveId = await seedDrive(db.admin, { owner: annaOwner, name: "Personal" });
    const file = await seedRegularFile(db.admin, {
      driveId,
      owner: annaOwner,
      parentId: null,
      name: "policy.pdf",
      sizeBytes: 4,
      createdByUserId: anna,
    });

    const result = await getFileDetails(db.db, anna, file);

    expect(result.outcome === "found" && result.value.breadcrumbs).toEqual([
      { kind: "drive", id: driveId, name: "Personal" },
    ]);
  });

  it("answers not found for a trashed file", async () => {
    const driveId = await seedDrive(db.admin, { owner: annaOwner, name: "Personal" });
    const file = await seedRegularFile(db.admin, {
      driveId,
      owner: annaOwner,
      parentId: null,
      name: "old.pdf",
      sizeBytes: 4,
      createdByUserId: anna,
      trashed: true,
    });

    expect(await getFileDetails(db.db, anna, file)).toEqual({ outcome: "not-found" });
  });

  it("answers not found for a file inside a trashed folder", async () => {
    const driveId = await seedDrive(db.admin, { owner: annaOwner, name: "Personal" });
    const folder = await seedFolder(db.admin, {
      driveId,
      owner: annaOwner,
      parentId: null,
      name: "Gone",
      trashed: true,
    });
    const file = await seedRegularFile(db.admin, {
      driveId,
      owner: annaOwner,
      parentId: folder,
      name: "inside.txt",
      sizeBytes: 1,
      createdByUserId: anna,
    });

    expect(await getFileDetails(db.db, anna, file)).toEqual({ outcome: "not-found" });
  });

  it("answers not found for a file in another family's drive", async () => {
    const familyDrive = await seedDrive(db.admin, { owner: familyBOwner, name: "Beta" });
    const file = await seedRegularFile(db.admin, {
      driveId: familyDrive,
      owner: familyBOwner,
      parentId: null,
      name: "secret.txt",
      sizeBytes: 1,
      createdByUserId: ben,
    });

    expect(await getFileDetails(db.db, anna, file)).toEqual({ outcome: "not-found" });
  });

  it("answers not found for another person's personal file", async () => {
    const bensDrive = await seedDrive(db.admin, { owner: benOwner, name: "Personal" });
    const file = await seedRegularFile(db.admin, {
      driveId: bensDrive,
      owner: benOwner,
      parentId: null,
      name: "ben.txt",
      sizeBytes: 1,
      createdByUserId: ben,
    });

    expect(await getFileDetails(db.db, anna, file)).toEqual({ outcome: "not-found" });
  });
});
