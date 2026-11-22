// SPDX-FileCopyrightText: 2026 Dominik Wadowski
// SPDX-License-Identifier: FSL-1.1-ALv2

import { randomUUID } from "node:crypto";
import { afterAll, beforeAll, beforeEach, describe, expect, it } from "vitest";
import { encodeCursor } from "../../domain/files/encode-cursor.js";
import { decodeCursor } from "../../domain/files/decode-cursor.js";
import { startFilesTestDatabase } from "../../../test/start-files-test-database.js";
import { seedDrive } from "../../../test/seed-drive.js";
import { seedFolder } from "../../../test/seed-folder.js";
import { seedRegularFile } from "../../../test/seed-regular-file.js";
import type { FilesTestDatabase, SeedOwner } from "../../../test/types.js";
import type { ChildrenQuery, ListedChildren } from "../../types.js";
import { listDriveChildren } from "./list-drive-children.js";
import { listFolderChildren } from "./list-folder-children.js";

const FIRST_PAGE: ChildrenQuery = { cursor: null, limit: 50 };

describe("listDriveChildren and listFolderChildren", { timeout: 60_000 }, () => {
  let db: FilesTestDatabase;
  const familyA = randomUUID();
  const familyB = randomUUID();
  const anna = randomUUID();
  const ben = randomUUID();
  const annaOwner: SeedOwner = { userId: anna, familyId: null };
  const familyAOwner: SeedOwner = { userId: null, familyId: familyA };
  const benFamilyOwner: SeedOwner = { userId: null, familyId: familyB };

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

  const namesOf = (listed: ListedChildren) => listed.page.records.map((record) => record.name);

  it("lists folders first, then files by name, at the drive root", async () => {
    const driveId = await seedDrive(db.admin, { owner: annaOwner, name: "Personal" });
    await seedRegularFile(db.admin, {
      driveId,
      owner: annaOwner,
      parentId: null,
      name: "banana.txt",
      sizeBytes: 3,
      createdByUserId: anna,
    });
    await seedRegularFile(db.admin, {
      driveId,
      owner: annaOwner,
      parentId: null,
      name: "apple.txt",
      sizeBytes: 3,
      createdByUserId: anna,
    });
    await seedFolder(db.admin, { driveId, owner: annaOwner, parentId: null, name: "Zoo" });
    await seedFolder(db.admin, { driveId, owner: annaOwner, parentId: null, name: "Beach" });

    const result = await listDriveChildren(db.db, anna, driveId, FIRST_PAGE);

    expect(result.outcome === "found" && namesOf(result.value)).toEqual([
      "Beach",
      "Zoo",
      "apple.txt",
      "banana.txt",
    ]);
  });

  it("pages through the root two entries at a time and ends with no cursor", async () => {
    const driveId = await seedDrive(db.admin, { owner: annaOwner, name: "Personal" });
    for (const name of ["a.txt", "b.txt", "c.txt", "d.txt", "e.txt"]) {
      await seedRegularFile(db.admin, {
        driveId,
        owner: annaOwner,
        parentId: null,
        name,
        sizeBytes: 1,
        createdByUserId: anna,
      });
    }
    const seen: string[] = [];
    let cursor: ChildrenQuery["cursor"] = null;
    let pages = 0;
    do {
      const result = await listDriveChildren(db.db, anna, driveId, { cursor, limit: 2 });
      if (result.outcome !== "found") {
        throw new Error("the drive should be visible");
      }
      seen.push(...namesOf(result.value));
      cursor = result.value.page.nextCursor;
      pages += 1;
    } while (cursor !== null && pages < 10);

    expect(seen).toEqual(["a.txt", "b.txt", "c.txt", "d.txt", "e.txt"]);
    expect(pages).toBe(3);
  });

  it("continues from an encoded cursor and returns the next position", async () => {
    const driveId = await seedDrive(db.admin, { owner: annaOwner, name: "Personal" });
    for (const name of ["a.txt", "b.txt", "c.txt"]) {
      await seedRegularFile(db.admin, {
        driveId,
        owner: annaOwner,
        parentId: null,
        name,
        sizeBytes: 1,
        createdByUserId: anna,
      });
    }
    const first = await listDriveChildren(db.db, anna, driveId, { cursor: null, limit: 1 });
    if (first.outcome !== "found" || first.value.page.nextCursor === null) {
      throw new Error("expected a second page");
    }
    const decoded = decodeCursor(encodeCursor(first.value.page.nextCursor));

    const second = await listDriveChildren(db.db, anna, driveId, {
      cursor: decoded,
      limit: 50,
    });

    expect(second.outcome === "found" && namesOf(second.value)).toEqual(["b.txt", "c.txt"]);
  });

  it("does not list trashed entries", async () => {
    const driveId = await seedDrive(db.admin, { owner: annaOwner, name: "Personal" });
    await seedRegularFile(db.admin, {
      driveId,
      owner: annaOwner,
      parentId: null,
      name: "kept.txt",
      sizeBytes: 1,
      createdByUserId: anna,
    });
    await seedRegularFile(db.admin, {
      driveId,
      owner: annaOwner,
      parentId: null,
      name: "old.txt",
      sizeBytes: 1,
      createdByUserId: anna,
      trashed: true,
    });

    const result = await listDriveChildren(db.db, anna, driveId, FIRST_PAGE);

    expect(result.outcome === "found" && namesOf(result.value)).toEqual(["kept.txt"]);
  });

  it("answers not found for another family's drive", async () => {
    const familyDrive = await seedDrive(db.admin, { owner: benFamilyOwner, name: "Other" });

    const result = await listDriveChildren(db.db, anna, familyDrive, FIRST_PAGE);

    expect(result).toEqual({ outcome: "not-found" });
  });

  it("answers not found for an unknown drive", async () => {
    const result = await listDriveChildren(db.db, anna, randomUUID(), FIRST_PAGE);

    expect(result).toEqual({ outcome: "not-found" });
  });

  it("answers not found for a former member's family drive", async () => {
    const familyDrive = await seedDrive(db.admin, { owner: familyAOwner, name: "The Smiths" });
    await db.admin.query(
      "UPDATE files.family_membership SET source_version = 2, is_member = false WHERE family_id = $1 AND user_id = $2",
      [familyA, anna],
    );

    const result = await listDriveChildren(db.db, anna, familyDrive, FIRST_PAGE);

    expect(result).toEqual({ outcome: "not-found" });
  });

  it("lists a nested folder with the path from the drive down to it", async () => {
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
    await seedRegularFile(db.admin, {
      driveId,
      owner: annaOwner,
      parentId: beach,
      name: "day-1.jpg",
      sizeBytes: 1,
      createdByUserId: anna,
    });

    const result = await listFolderChildren(db.db, anna, beach, FIRST_PAGE);

    expect(result.outcome === "found" && namesOf(result.value)).toEqual(["day-1.jpg"]);
    expect(result.outcome === "found" && result.value.breadcrumbs).toEqual([
      { kind: "drive", id: driveId, name: "Personal" },
      { kind: "folder", id: holiday, name: "Holiday" },
      { kind: "folder", id: beach, name: "Beach" },
    ]);
  });

  it("answers not found for a trashed folder, for a file id and for another family's folder", async () => {
    const driveId = await seedDrive(db.admin, { owner: annaOwner, name: "Personal" });
    const trashedFolder = await seedFolder(db.admin, {
      driveId,
      owner: annaOwner,
      parentId: null,
      name: "Gone",
      trashed: true,
    });
    const file = await seedRegularFile(db.admin, {
      driveId,
      owner: annaOwner,
      parentId: null,
      name: "note.txt",
      sizeBytes: 1,
      createdByUserId: anna,
    });
    const familyDrive = await seedDrive(db.admin, { owner: benFamilyOwner, name: "Other" });
    const benFolder = await seedFolder(db.admin, {
      driveId: familyDrive,
      owner: benFamilyOwner,
      parentId: null,
      name: "Private",
    });

    expect(await listFolderChildren(db.db, anna, trashedFolder, FIRST_PAGE)).toEqual({
      outcome: "not-found",
    });
    expect(await listFolderChildren(db.db, anna, file, FIRST_PAGE)).toEqual({
      outcome: "not-found",
    });
    expect(await listFolderChildren(db.db, anna, benFolder, FIRST_PAGE)).toEqual({
      outcome: "not-found",
    });
  });

  it("counts the live direct children of each folder on the page", async () => {
    const driveId = await seedDrive(db.admin, { owner: annaOwner, name: "Personal" });
    const photos = await seedFolder(db.admin, {
      driveId,
      owner: annaOwner,
      parentId: null,
      name: "Photos",
    });
    const empty = await seedFolder(db.admin, {
      driveId,
      owner: annaOwner,
      parentId: null,
      name: "Empty",
    });
    const album = await seedFolder(db.admin, {
      driveId,
      owner: annaOwner,
      parentId: photos,
      name: "Album",
    });
    await seedFolder(db.admin, { driveId, owner: annaOwner, parentId: album, name: "Deep" });
    await seedRegularFile(db.admin, {
      driveId,
      owner: annaOwner,
      parentId: photos,
      name: "a.txt",
      sizeBytes: 1,
      createdByUserId: anna,
    });
    await seedRegularFile(db.admin, {
      driveId,
      owner: annaOwner,
      parentId: photos,
      name: "b.txt",
      sizeBytes: 1,
      createdByUserId: anna,
    });
    await seedRegularFile(db.admin, {
      driveId,
      owner: annaOwner,
      parentId: photos,
      name: "gone.txt",
      sizeBytes: 1,
      createdByUserId: anna,
      trashed: true,
    });

    const root = await listDriveChildren(db.db, anna, driveId, FIRST_PAGE);
    const inPhotos = await listFolderChildren(db.db, anna, photos, FIRST_PAGE);

    expect(
      root.outcome === "found" && [
        root.value.itemCounts.get(photos),
        root.value.itemCounts.get(empty),
      ],
    ).toEqual([3, 0]);
    expect(inPhotos.outcome === "found" && inPhotos.value.itemCounts.get(album)).toBe(1);
  });
});
