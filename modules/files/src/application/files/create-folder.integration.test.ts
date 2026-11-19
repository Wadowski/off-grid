// SPDX-FileCopyrightText: 2026 Dominik Wadowski
// SPDX-License-Identifier: FSL-1.1-ALv2

import { randomUUID } from "node:crypto";
import { afterAll, beforeAll, beforeEach, describe, expect, it } from "vitest";
import { startFilesTestDatabase } from "../../../test/start-files-test-database.js";
import { seedDrive } from "../../../test/seed-drive.js";
import { seedFolder } from "../../../test/seed-folder.js";
import { seedRegularFile } from "../../../test/seed-regular-file.js";
import type { FilesTestDatabase, SeedOwner } from "../../../test/types.js";
import { NameTakenError } from "../errors/name-taken-error.js";
import { createFolder } from "./create-folder.js";

describe("createFolder", { timeout: 60_000 }, () => {
  let db: FilesTestDatabase;
  const familyId = randomUUID();
  const anna = randomUUID();
  const ben = randomUUID();
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
    await db.admin.query("TRUNCATE outbox.event, outbox.subscriber_cursor, outbox.dead_letter");
    await db.admin.query(
      "INSERT INTO files.family_membership (family_id, user_id, source_version, is_member) VALUES ($1, $2, 1, true)",
      [familyId, anna],
    );
  });

  const createdEvents = async () => {
    const { rows } = await db.admin.query<{
      type: string;
      source_version: string;
      payload: { name: string };
    }>(
      "SELECT type, source_version, payload FROM outbox.event WHERE type = 'file-created-v1' ORDER BY sequence",
    );
    return rows;
  };

  const fileRows = async () => {
    const { rows } = await db.admin.query<{ name: string; is_folder: boolean; version: number }>(
      "SELECT name, is_folder, version FROM files.file ORDER BY name",
    );
    return rows;
  };

  it("creates a folder at the root of a personal drive and publishes one created event", async () => {
    const driveId = await seedDrive(db.admin, { owner: annaOwner, name: "Personal" });

    const result = await createFolder(db.db, anna, driveId, { parentId: null, name: "Holiday" });

    expect(result).toEqual({
      outcome: "found",
      value: expect.objectContaining({
        name: "Holiday",
        isFolder: true,
        version: 1,
        parentId: null,
      }),
    });
    expect(await createdEvents()).toEqual([
      expect.objectContaining({ type: "file-created-v1", source_version: "1" }),
    ]);
  });

  it("creates a folder inside a live folder", async () => {
    const driveId = await seedDrive(db.admin, { owner: annaOwner, name: "Personal" });
    const holiday = await seedFolder(db.admin, {
      driveId,
      owner: annaOwner,
      parentId: null,
      name: "Holiday",
    });

    const result = await createFolder(db.db, anna, driveId, { parentId: holiday, name: "Beach" });

    expect(result.outcome === "found" && result.value.parentId).toBe(holiday);
  });

  it("creates a folder in the family drive for a family member", async () => {
    const driveId = await seedDrive(db.admin, { owner: familyOwner, name: "The Smiths" });

    const result = await createFolder(db.db, anna, driveId, { parentId: null, name: "Holiday" });

    expect(result.outcome).toBe("found");
    expect(await createdEvents()).toEqual([
      expect.objectContaining({ type: "file-created-v1", source_version: "1" }),
    ]);
  });

  it("refuses a name already used in the same folder, ignoring case", async () => {
    const driveId = await seedDrive(db.admin, { owner: annaOwner, name: "Personal" });
    await seedFolder(db.admin, { driveId, owner: annaOwner, parentId: null, name: "Holiday" });

    await expect(
      createFolder(db.db, anna, driveId, { parentId: null, name: "HOLIDAY" }),
    ).rejects.toBeInstanceOf(NameTakenError);
    expect(await fileRows()).toEqual([{ name: "Holiday", is_folder: true, version: 1 }]);
    expect(await createdEvents()).toEqual([]);
  });

  it("allows the same name in a different folder", async () => {
    const driveId = await seedDrive(db.admin, { owner: annaOwner, name: "Personal" });
    const holiday = await seedFolder(db.admin, {
      driveId,
      owner: annaOwner,
      parentId: null,
      name: "Holiday",
    });
    await seedFolder(db.admin, { driveId, owner: annaOwner, parentId: null, name: "Work" });

    const result = await createFolder(db.db, anna, driveId, { parentId: holiday, name: "Work" });

    expect(result.outcome).toBe("found");
  });

  it("answers not-found for a drive the person cannot see", async () => {
    const driveId = await seedDrive(db.admin, {
      owner: { userId: ben, familyId: null },
      name: "Personal",
    });

    expect(await createFolder(db.db, anna, driveId, { parentId: null, name: "Holiday" })).toEqual({
      outcome: "not-found",
    });
    expect(await createdEvents()).toEqual([]);
  });

  it("answers not-found for a parent that is a regular file", async () => {
    const driveId = await seedDrive(db.admin, { owner: annaOwner, name: "Personal" });
    const file = await seedRegularFile(db.admin, {
      driveId,
      owner: annaOwner,
      parentId: null,
      name: "notes.txt",
      sizeBytes: 3,
      createdByUserId: anna,
    });

    expect(await createFolder(db.db, anna, driveId, { parentId: file, name: "Holiday" })).toEqual({
      outcome: "not-found",
    });
  });

  it("answers not-found for a trashed parent and for a parent in another drive", async () => {
    const driveId = await seedDrive(db.admin, { owner: annaOwner, name: "Personal" });
    const otherDrive = await seedDrive(db.admin, { owner: familyOwner, name: "The Smiths" });
    const trashed = await seedFolder(db.admin, {
      driveId,
      owner: annaOwner,
      parentId: null,
      name: "Old",
      trashed: true,
    });
    const elsewhere = await seedFolder(db.admin, {
      driveId: otherDrive,
      owner: familyOwner,
      parentId: null,
      name: "Elsewhere",
    });

    expect(await createFolder(db.db, anna, driveId, { parentId: trashed, name: "A" })).toEqual({
      outcome: "not-found",
    });
    expect(await createFolder(db.db, anna, driveId, { parentId: elsewhere, name: "B" })).toEqual({
      outcome: "not-found",
    });
  });

  it("answers not-found for a folder inside a trashed folder", async () => {
    const driveId = await seedDrive(db.admin, { owner: annaOwner, name: "Personal" });
    const trashed = await seedFolder(db.admin, {
      driveId,
      owner: annaOwner,
      parentId: null,
      name: "Old",
      trashed: true,
    });
    const inside = await seedFolder(db.admin, {
      driveId,
      owner: annaOwner,
      parentId: trashed,
      name: "Inside",
    });

    expect(await createFolder(db.db, anna, driveId, { parentId: inside, name: "A" })).toEqual({
      outcome: "not-found",
    });
  });
});
