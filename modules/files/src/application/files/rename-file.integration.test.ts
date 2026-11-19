// SPDX-FileCopyrightText: 2026 Dominik Wadowski
// SPDX-License-Identifier: FSL-1.1-ALv2

import { randomUUID } from "node:crypto";
import { afterAll, beforeAll, beforeEach, describe, expect, it } from "vitest";
import { startFilesTestDatabase } from "../../../test/start-files-test-database.js";
import { seedDrive } from "../../../test/seed-drive.js";
import { seedFolder } from "../../../test/seed-folder.js";
import type { FilesTestDatabase, SeedOwner } from "../../../test/types.js";
import { NameTakenError } from "../errors/name-taken-error.js";
import { renameFile } from "./rename-file.js";

describe("renameFile", { timeout: 60_000 }, () => {
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

  const versionOf = async (fileId: string) => {
    const { rows } = await db.admin.query<{ name: string; version: number }>(
      "SELECT name, version FROM files.file WHERE file_id = $1",
      [fileId],
    );
    return rows[0];
  };

  const updatedEvents = async () => {
    const { rows } = await db.admin.query<{ source_version: string; payload: { name: string } }>(
      "SELECT source_version, payload FROM outbox.event WHERE type = 'file-updated-v1' ORDER BY sequence",
    );
    return rows;
  };

  it("renames a folder, bumps its version and publishes one updated event", async () => {
    const driveId = await seedDrive(db.admin, { owner: annaOwner, name: "Personal" });
    const holiday = await seedFolder(db.admin, {
      driveId,
      owner: annaOwner,
      parentId: null,
      name: "Holiday",
    });

    const result = await renameFile(db.db, anna, holiday, "Summer");

    expect(result.outcome === "found" && result.value).toMatchObject({
      name: "Summer",
      version: 2,
    });
    expect(await versionOf(holiday)).toEqual({ name: "Summer", version: 2 });
    expect(await updatedEvents()).toEqual([
      expect.objectContaining({
        source_version: "2",
        payload: expect.objectContaining({ name: "Summer" }),
      }),
    ]);
  });

  it("changes nothing when the name is the same", async () => {
    const driveId = await seedDrive(db.admin, { owner: annaOwner, name: "Personal" });
    const holiday = await seedFolder(db.admin, {
      driveId,
      owner: annaOwner,
      parentId: null,
      name: "Holiday",
    });

    const result = await renameFile(db.db, anna, holiday, "Holiday");

    expect(result.outcome === "found" && result.value.version).toBe(1);
    expect(await versionOf(holiday)).toEqual({ name: "Holiday", version: 1 });
    expect(await updatedEvents()).toEqual([]);
  });

  it("allows a change of letter case for the same entry", async () => {
    const driveId = await seedDrive(db.admin, { owner: annaOwner, name: "Personal" });
    const holiday = await seedFolder(db.admin, {
      driveId,
      owner: annaOwner,
      parentId: null,
      name: "Holiday",
    });

    await renameFile(db.db, anna, holiday, "holiday");

    expect(await versionOf(holiday)).toEqual({ name: "holiday", version: 2 });
  });

  it("refuses the name of a sibling, ignoring case, and changes nothing", async () => {
    const driveId = await seedDrive(db.admin, { owner: annaOwner, name: "Personal" });
    const holiday = await seedFolder(db.admin, {
      driveId,
      owner: annaOwner,
      parentId: null,
      name: "Holiday",
    });
    await seedFolder(db.admin, { driveId, owner: annaOwner, parentId: null, name: "Work" });

    await expect(renameFile(db.db, anna, holiday, "WORK")).rejects.toBeInstanceOf(NameTakenError);
    expect(await versionOf(holiday)).toEqual({ name: "Holiday", version: 1 });
    expect(await updatedEvents()).toEqual([]);
  });

  it("leaves the children of a renamed folder untouched", async () => {
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

    await renameFile(db.db, anna, holiday, "Summer");

    expect(await versionOf(beach)).toEqual({ name: "Beach", version: 1 });
    expect(await updatedEvents()).toHaveLength(1);
  });

  it("renames a folder in the family drive for a family member", async () => {
    const driveId = await seedDrive(db.admin, { owner: familyOwner, name: "The Smiths" });
    const holiday = await seedFolder(db.admin, {
      driveId,
      owner: familyOwner,
      parentId: null,
      name: "Holiday",
    });

    const result = await renameFile(db.db, anna, holiday, "Summer");

    expect(result.outcome).toBe("found");
    expect(await updatedEvents()).toEqual([expect.objectContaining({ source_version: "2" })]);
  });

  it("answers not-found for a non-member, a folder under a trashed folder, and a trashed folder", async () => {
    const driveId = await seedDrive(db.admin, { owner: familyOwner, name: "The Smiths" });
    const holiday = await seedFolder(db.admin, {
      driveId,
      owner: familyOwner,
      parentId: null,
      name: "Holiday",
    });
    const trashed = await seedFolder(db.admin, {
      driveId,
      owner: familyOwner,
      parentId: null,
      name: "Old",
      trashed: true,
    });
    const inside = await seedFolder(db.admin, {
      driveId,
      owner: familyOwner,
      parentId: trashed,
      name: "Inside",
    });

    expect(await renameFile(db.db, ben, holiday, "Summer")).toEqual({ outcome: "not-found" });
    expect(await renameFile(db.db, anna, inside, "Renamed")).toEqual({ outcome: "not-found" });
    expect(await renameFile(db.db, anna, trashed, "Renamed")).toEqual({ outcome: "not-found" });
    expect(await renameFile(db.db, anna, randomUUID(), "Renamed")).toEqual({
      outcome: "not-found",
    });
    expect(await updatedEvents()).toEqual([]);
  });
});
