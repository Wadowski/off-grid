// SPDX-FileCopyrightText: 2026 Dominik Wadowski
// SPDX-License-Identifier: FSL-1.1-ALv2

import { randomUUID } from "node:crypto";
import { afterAll, beforeAll, beforeEach, describe, expect, it } from "vitest";
import { startFilesTestDatabase } from "../../../test/start-files-test-database.js";
import { seedDrive } from "../../../test/seed-drive.js";
import { seedFolder } from "../../../test/seed-folder.js";
import { seedRegularFile } from "../../../test/seed-regular-file.js";
import type { FilesTestDatabase, SeedOwner } from "../../../test/types.js";
import type {
  ChildrenCursor,
  ChildrenDirection,
  ChildrenSort,
  ListedChildren,
} from "../../types.js";
import { listDriveChildren } from "./list-drive-children.js";

describe("listDriveChildren with a sort", { timeout: 60_000 }, () => {
  let db: FilesTestDatabase;
  const anna = randomUUID();
  const owner: SeedOwner = { userId: anna, familyId: null };

  beforeAll(async () => {
    db = await startFilesTestDatabase();
  }, 120_000);

  afterAll(async () => {
    await db.stop();
  }, 120_000);

  beforeEach(async () => {
    await db.reset();
  });

  const namesOf = (listed: ListedChildren) => listed.page.records.map((record) => record.name);

  const seedFile = async (driveId: string, name: string, sizeBytes: number, updatedAt: string) => {
    const fileId = await seedRegularFile(db.admin, {
      driveId,
      owner,
      parentId: null,
      name,
      sizeBytes,
      createdByUserId: anna,
    });
    await db.admin.query("UPDATE files.file SET updated_at = $2 WHERE file_id = $1", [
      fileId,
      updatedAt,
    ]);
    return fileId;
  };

  const seedFolderAt = async (driveId: string, name: string, updatedAt: string) => {
    const folderId = await seedFolder(db.admin, { driveId, owner, parentId: null, name });
    await db.admin.query("UPDATE files.file SET updated_at = $2 WHERE file_id = $1", [
      folderId,
      updatedAt,
    ]);
  };

  const seedSortedDrive = async () => {
    const driveId = await seedDrive(db.admin, { owner, name: "Personal" });
    await seedFile(driveId, "small.txt", 10, "2026-01-02T10:00:00Z");
    await seedFile(driveId, "big.txt", 500, "2026-01-01T10:00:00Z");
    await seedFile(driveId, "medium.txt", 100, "2026-01-03T10:00:00Z");
    await seedFolderAt(driveId, "Zoo", "2026-01-05T10:00:00Z");
    await seedFolderAt(driveId, "Beach", "2026-01-04T10:00:00Z");
    return driveId;
  };

  const listAll = async (driveId: string, sort: ChildrenSort, direction: ChildrenDirection) => {
    const result = await listDriveChildren(db.db, anna, driveId, {
      cursor: null,
      limit: 50,
      sort,
      direction,
    });
    return result.outcome === "found" ? namesOf(result.value) : [];
  };

  const pageThrough = async (
    driveId: string,
    sort: ChildrenSort,
    direction: ChildrenDirection,
    limit: number,
  ) => {
    const seen: string[] = [];
    let cursor: ChildrenCursor | null = null;
    for (let page = 0; page < 20; page += 1) {
      const result = await listDriveChildren(db.db, anna, driveId, {
        cursor,
        limit,
        sort,
        direction,
      });
      if (result.outcome !== "found") {
        throw new Error("the drive should be visible");
      }
      seen.push(...namesOf(result.value));
      cursor = result.value.page.nextCursor;
      if (cursor === null) {
        break;
      }
    }
    return seen;
  };

  it("sorts files by size and keeps folders first, ordered by name", async () => {
    const driveId = await seedSortedDrive();

    expect(await listAll(driveId, "size", "asc")).toEqual([
      "Beach",
      "Zoo",
      "small.txt",
      "medium.txt",
      "big.txt",
    ]);
    expect(await listAll(driveId, "size", "desc")).toEqual([
      "Zoo",
      "Beach",
      "big.txt",
      "medium.txt",
      "small.txt",
    ]);
  });

  it("sorts by last modified in both directions", async () => {
    const driveId = await seedSortedDrive();

    expect(await listAll(driveId, "modified", "asc")).toEqual([
      "Beach",
      "Zoo",
      "big.txt",
      "small.txt",
      "medium.txt",
    ]);
    expect(await listAll(driveId, "modified", "desc")).toEqual([
      "Zoo",
      "Beach",
      "medium.txt",
      "small.txt",
      "big.txt",
    ]);
  });

  it("lists a folder updated after every file first under modified ascending", async () => {
    const driveId = await seedDrive(db.admin, { owner, name: "Personal" });
    await seedFile(driveId, "early.txt", 10, "2026-01-01T10:00:00Z");
    await seedFile(driveId, "late.txt", 10, "2026-01-02T10:00:00Z");
    await seedFolderAt(driveId, "Newest", "2026-06-01T10:00:00Z");

    expect(await listAll(driveId, "modified", "asc")).toEqual(["Newest", "early.txt", "late.txt"]);
  });

  it("keeps folders before files across a page boundary under size descending", async () => {
    const driveId = await seedSortedDrive();

    const paged = await pageThrough(driveId, "size", "desc", 2);

    expect(paged).toEqual(["Zoo", "Beach", "big.txt", "medium.txt", "small.txt"]);
    expect(new Set(paged).size).toBe(paged.length);
  });

  it("sorts by name descending and keeps folders first", async () => {
    const driveId = await seedSortedDrive();

    expect(await listAll(driveId, "name", "desc")).toEqual([
      "Zoo",
      "Beach",
      "small.txt",
      "medium.txt",
      "big.txt",
    ]);
  });

  it.each([
    ["size", "asc"],
    ["size", "desc"],
    ["modified", "asc"],
    ["modified", "desc"],
    ["name", "desc"],
  ] as const)("pages %s %s the same as one long page", async (sort, direction) => {
    const driveId = await seedSortedDrive();

    const onePage = await listAll(driveId, sort, direction);

    expect(await pageThrough(driveId, sort, direction, 1)).toEqual(onePage);
    expect(await pageThrough(driveId, sort, direction, 2)).toEqual(onePage);
  });

  it("keeps the order stable across pages when sort values tie", async () => {
    const driveId = await seedDrive(db.admin, { owner, name: "Personal" });
    for (const name of ["a.bin", "b.bin", "c.bin", "d.bin"]) {
      await seedFile(driveId, name, 42, "2026-01-01T10:00:00Z");
    }

    const onePage = await listAll(driveId, "size", "asc");

    expect(onePage).toHaveLength(4);
    expect(await pageThrough(driveId, "size", "asc", 1)).toEqual(onePage);
  });
});
