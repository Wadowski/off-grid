// SPDX-FileCopyrightText: 2026 Dominik Wadowski
// SPDX-License-Identifier: FSL-1.1-ALv2

import { randomUUID } from "node:crypto";
import { afterAll, beforeAll, beforeEach, describe, expect, it } from "vitest";
import { seedDrive } from "../../../test/seed-drive.js";
import { seedFolder } from "../../../test/seed-folder.js";
import { seedRegularFile } from "../../../test/seed-regular-file.js";
import { startFilesTestDatabase } from "../../../test/start-files-test-database.js";
import type { FilesTestDatabase, SeedOwner } from "../../../test/types.js";
import { listDriveTrash } from "./list-drive-trash.js";

describe("listDriveTrash", { timeout: 60_000 }, () => {
  let db: FilesTestDatabase;
  const anna = randomUUID();
  const ben = randomUUID();
  const annaOwner: SeedOwner = { userId: anna, familyId: null };
  const benOwner: SeedOwner = { userId: ben, familyId: null };

  beforeAll(async () => {
    db = await startFilesTestDatabase();
  }, 120_000);

  afterAll(async () => {
    await db.stop();
  }, 120_000);

  beforeEach(async () => {
    await db.reset();
  });

  it("lists only trashed rows, including a row trashed inside a trashed folder", async () => {
    const driveId = await seedDrive(db.admin, { owner: annaOwner, name: "Personal" });
    const folderId = await seedFolder(db.admin, {
      driveId,
      owner: annaOwner,
      parentId: null,
      name: "Old",
      trashed: true,
    });
    await seedRegularFile(db.admin, {
      driveId,
      owner: annaOwner,
      parentId: folderId,
      name: "inner.txt",
      sizeBytes: 1,
      createdByUserId: anna,
      trashed: true,
    });
    await seedRegularFile(db.admin, {
      driveId,
      owner: annaOwner,
      parentId: null,
      name: "keep.txt",
      sizeBytes: 1,
      createdByUserId: anna,
    });

    const outcome = await listDriveTrash(db.db, anna, driveId, { cursor: null, limit: 50 });

    expect(
      outcome.outcome === "found" ? outcome.value.page.records.map((record) => record.name) : [],
    ).toEqual(["Old", "inner.txt"]);
  });

  it("answers not-found for another person's drive", async () => {
    const otherDriveId = await seedDrive(db.admin, { owner: benOwner, name: "Personal" });

    expect(
      (await listDriveTrash(db.db, anna, otherDriveId, { cursor: null, limit: 50 })).outcome,
    ).toBe("not-found");
  });
});
