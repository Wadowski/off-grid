// SPDX-FileCopyrightText: 2026 Dominik Wadowski
// SPDX-License-Identifier: FSL-1.1-ALv2

import { randomUUID } from "node:crypto";
import { Readable } from "node:stream";
import { createInMemoryFileStorage, type FileStorage } from "@offgrid/file-storage";
import { afterAll, beforeAll, beforeEach, describe, expect, it } from "vitest";
import { startFilesTestDatabase } from "../../../test/start-files-test-database.js";
import { seedDrive } from "../../../test/seed-drive.js";
import { seedFolder } from "../../../test/seed-folder.js";
import { seedRegularFile } from "../../../test/seed-regular-file.js";
import type { FilesTestDatabase, SeedOwner } from "../../../test/types.js";
import { InvalidMoveError } from "../errors/invalid-move-error.js";
import { NameTakenError } from "../errors/name-taken-error.js";
import { moveFile } from "./move-file.js";

describe("moveFile to another owner", { timeout: 60_000 }, () => {
  let db: FilesTestDatabase;
  let storage: FileStorage;
  const familyId = randomUUID();
  const anna = randomUUID();
  const annaOwner: SeedOwner = { userId: anna, familyId: null };
  const familyOwner: SeedOwner = { userId: null, familyId };

  beforeAll(async () => {
    db = await startFilesTestDatabase();
  }, 120_000);

  afterAll(async () => {
    await db.stop();
  }, 120_000);

  beforeEach(async () => {
    await db.reset();
    storage = createInMemoryFileStorage();
    await db.admin.query("TRUNCATE outbox.event, outbox.subscriber_cursor, outbox.dead_letter");
    await db.admin.query(
      "INSERT INTO files.family_membership (family_id, user_id, source_version, is_member) VALUES ($1, $2, 1, true)",
      [familyId, anna],
    );
  });

  const storedKeys = async () => {
    const keys: string[] = [];
    for await (const entry of storage.listKeys()) {
      keys.push(entry.key);
    }
    return keys.sort();
  };

  const rowsIn = async (driveId: string) => {
    const { rows } = await db.admin.query<{
      name: string;
      parent_id: string | null;
      version: number;
    }>("SELECT name, parent_id, version FROM files.file WHERE drive_id = $1 ORDER BY name", [
      driveId,
    ]);
    return rows;
  };

  const eventsOf = async (type: string) => {
    const { rows } = await db.admin.query<{
      source_version: string;
      family_id: string | null;
      user_id: string | null;
    }>(
      "SELECT source_version, family_id, user_id FROM outbox.event WHERE type = $1 ORDER BY sequence",
      [type],
    );
    return rows;
  };

  const storeBytes = async (text: string) =>
    (await storage.put(Readable.from([Buffer.from(text)]))).key;

  it("copies a folder tree with its file bytes to the family drive and removes the source", async () => {
    const personal = await seedDrive(db.admin, { owner: annaOwner, name: "Personal" });
    const family = await seedDrive(db.admin, { owner: familyOwner, name: "The Smiths" });
    const holiday = await seedFolder(db.admin, {
      driveId: personal,
      owner: annaOwner,
      parentId: null,
      name: "Holiday",
    });
    const beach = await seedFolder(db.admin, {
      driveId: personal,
      owner: annaOwner,
      parentId: holiday,
      name: "Beach",
    });
    const sourceKey = await storeBytes("sunset");
    await seedRegularFile(db.admin, {
      driveId: personal,
      owner: annaOwner,
      parentId: beach,
      name: "sunset.jpg",
      sizeBytes: 6,
      createdByUserId: anna,
      storageKey: sourceKey,
    });

    const result = await moveFile(db.db, storage, anna, holiday, {
      driveId: family,
      parentId: null,
    });

    expect(result.outcome === "found" && result.value.crossOwnerNotice).toBe(true);
    expect(result.outcome === "found" && result.value.file.id).not.toBe(holiday);
    expect(await rowsIn(personal)).toEqual([]);
    expect(await rowsIn(family)).toEqual([
      { name: "Beach", parent_id: expect.any(String), version: 1 },
      { name: "Holiday", parent_id: null, version: 1 },
      { name: "sunset.jpg", parent_id: expect.any(String), version: 1 },
    ]);
    expect(await storedKeys()).not.toContain(sourceKey);
    expect(await storedKeys()).toHaveLength(1);
    expect(await eventsOf("file-created-v1")).toEqual([
      { source_version: "1", family_id: familyId, user_id: null },
      { source_version: "1", family_id: familyId, user_id: null },
      { source_version: "1", family_id: familyId, user_id: null },
    ]);
    expect(await eventsOf("file-removed-v1")).toEqual([
      { source_version: "1", family_id: null, user_id: anna },
      { source_version: "1", family_id: null, user_id: anna },
      { source_version: "1", family_id: null, user_id: anna },
    ]);
  });

  it("removes no source and stores no copy when the copy of a byte fails midway", async () => {
    const personal = await seedDrive(db.admin, { owner: annaOwner, name: "Personal" });
    const family = await seedDrive(db.admin, { owner: familyOwner, name: "The Smiths" });
    const holiday = await seedFolder(db.admin, {
      driveId: personal,
      owner: annaOwner,
      parentId: null,
      name: "Holiday",
    });
    const first = await storeBytes("first");
    const second = await storeBytes("second");
    await seedRegularFile(db.admin, {
      driveId: personal,
      owner: annaOwner,
      parentId: holiday,
      name: "a.txt",
      sizeBytes: 5,
      createdByUserId: anna,
      storageKey: first,
    });
    await seedRegularFile(db.admin, {
      driveId: personal,
      owner: annaOwner,
      parentId: holiday,
      name: "b.txt",
      sizeBytes: 6,
      createdByUserId: anna,
      storageKey: second,
    });
    const keysBefore = await storedKeys();
    const failing: FileStorage = {
      ...storage,
      get: async (key, range) => {
        if (key === second) {
          throw new Error("disk unavailable");
        }
        return storage.get(key, range);
      },
    };

    await expect(
      moveFile(db.db, failing, anna, holiday, { driveId: family, parentId: null }),
    ).rejects.toThrow("disk unavailable");

    expect(await storedKeys()).toEqual(keysBefore);
    expect(await rowsIn(family)).toEqual([]);
    expect(await rowsIn(personal)).toHaveLength(3);
    expect(await eventsOf("file-created-v1")).toEqual([]);
    expect(await eventsOf("file-removed-v1")).toEqual([]);
  });

  it("refuses a source changed while its bytes were copied, removes the copies and changes nothing", async () => {
    const personal = await seedDrive(db.admin, { owner: annaOwner, name: "Personal" });
    const family = await seedDrive(db.admin, { owner: familyOwner, name: "The Smiths" });
    const holiday = await seedFolder(db.admin, {
      driveId: personal,
      owner: annaOwner,
      parentId: null,
      name: "Holiday",
    });
    const key = await storeBytes("sunset");
    await seedRegularFile(db.admin, {
      driveId: personal,
      owner: annaOwner,
      parentId: holiday,
      name: "sunset.jpg",
      sizeBytes: 6,
      createdByUserId: anna,
      storageKey: key,
    });
    const keysBefore = await storedKeys();
    const renamingDuringCopy: FileStorage = {
      ...storage,
      put: async (source, options) => {
        const stored = await storage.put(source, options);
        await db.admin.query("UPDATE files.file SET name = 'Renamed' WHERE file_id = $1", [
          holiday,
        ]);
        return stored;
      },
    };

    await expect(
      moveFile(db.db, renamingDuringCopy, anna, holiday, { driveId: family, parentId: null }),
    ).rejects.toBeInstanceOf(InvalidMoveError);

    expect(await storedKeys()).toEqual(keysBefore);
    expect(await rowsIn(family)).toEqual([]);
    expect(await rowsIn(personal)).toEqual([
      { name: "Renamed", parent_id: null, version: 1 },
      { name: "sunset.jpg", parent_id: expect.any(String), version: 1 },
    ]);
    expect(await eventsOf("file-removed-v1")).toEqual([]);
  });

  it("refuses a name already used in the family drive before copying any bytes", async () => {
    const personal = await seedDrive(db.admin, { owner: annaOwner, name: "Personal" });
    const family = await seedDrive(db.admin, { owner: familyOwner, name: "The Smiths" });
    const holiday = await seedFolder(db.admin, {
      driveId: personal,
      owner: annaOwner,
      parentId: null,
      name: "Holiday",
    });
    await seedFolder(db.admin, {
      driveId: family,
      owner: familyOwner,
      parentId: null,
      name: "holiday",
    });
    const putSpy = { calls: 0 };
    const counting: FileStorage = {
      ...storage,
      put: async (source, options) => {
        putSpy.calls += 1;
        return storage.put(source, options);
      },
    };

    await expect(
      moveFile(db.db, counting, anna, holiday, { driveId: family, parentId: null }),
    ).rejects.toBeInstanceOf(NameTakenError);

    expect(putSpy.calls).toBe(0);
    expect(await rowsIn(personal)).toHaveLength(1);
  });

  it("answers not-found for a target drive the person cannot see", async () => {
    const personal = await seedDrive(db.admin, { owner: annaOwner, name: "Personal" });
    const ben = randomUUID();
    const bens = await seedDrive(db.admin, {
      owner: { userId: ben, familyId: null },
      name: "Personal",
    });
    const holiday = await seedFolder(db.admin, {
      driveId: personal,
      owner: annaOwner,
      parentId: null,
      name: "Holiday",
    });

    expect(
      await moveFile(db.db, storage, anna, holiday, { driveId: bens, parentId: null }),
    ).toEqual({ outcome: "not-found" });
    expect(await rowsIn(personal)).toHaveLength(1);
  });
});
