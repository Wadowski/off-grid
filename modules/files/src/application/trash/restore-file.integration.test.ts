// SPDX-FileCopyrightText: 2026 Dominik Wadowski
// SPDX-License-Identifier: FSL-1.1-ALv2

import { randomUUID } from "node:crypto";
import { afterAll, beforeAll, beforeEach, describe, expect, it } from "vitest";
import { seedDrive } from "../../../test/seed-drive.js";
import { seedFolder } from "../../../test/seed-folder.js";
import { seedRegularFile } from "../../../test/seed-regular-file.js";
import { startFilesTestDatabase } from "../../../test/start-files-test-database.js";
import type { FilesTestDatabase, SeedOwner } from "../../../test/types.js";
import { restoreTrashedFile } from "../../infrastructure/trash/restore-trashed-file.js";
import { writeAsUser } from "../write-as-user.js";
import { restoreFile } from "./restore-file.js";
import { trashFile } from "./trash-file.js";
import { NotTrashedError } from "../errors/not-trashed-error.js";

describe("restoreFile", { timeout: 60_000 }, () => {
  let db: FilesTestDatabase;
  const anna = randomUUID();
  const ben = randomUUID();
  const chris = randomUUID();
  const familyId = randomUUID();
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
    await db.admin.query(
      "INSERT INTO files.family_membership (family_id, user_id, source_version, is_member) VALUES ($1, $2, 1, true), ($1, $3, 1, false)",
      [familyId, ben, chris],
    );
  });

  it("returns a trashed file to its original folder when the folder is live", async () => {
    const driveId = await seedDrive(db.admin, { owner: annaOwner, name: "Personal" });
    const folderId = await seedFolder(db.admin, {
      driveId,
      owner: annaOwner,
      parentId: null,
      name: "Docs",
    });
    const fileId = await seedRegularFile(db.admin, {
      driveId,
      owner: annaOwner,
      parentId: folderId,
      name: "a.pdf",
      sizeBytes: 1,
      createdByUserId: anna,
    });
    await trashFile(db.db, anna, fileId);

    const outcome = await restoreFile(db.db, anna, fileId);

    expect(outcome.outcome === "found" ? outcome.value.parentId : null).toBe(folderId);
    const row = await db.admin.query<{ deleted_at: Date | null; version: number }>(
      "SELECT deleted_at, version FROM files.file WHERE file_id = $1",
      [fileId],
    );
    expect(row.rows[0]?.deleted_at).toBeNull();
    expect(row.rows[0]?.version).toBe(3);
  });

  it("returns a file to the drive root when its folder is in the trash", async () => {
    const driveId = await seedDrive(db.admin, { owner: annaOwner, name: "Personal" });
    const folderId = await seedFolder(db.admin, {
      driveId,
      owner: annaOwner,
      parentId: null,
      name: "Docs",
    });
    const fileId = await seedRegularFile(db.admin, {
      driveId,
      owner: annaOwner,
      parentId: folderId,
      name: "a.pdf",
      sizeBytes: 1,
      createdByUserId: anna,
      trashed: true,
    });
    await trashFile(db.db, anna, folderId);

    const outcome = await restoreFile(db.db, anna, fileId);

    expect(outcome.outcome === "found" ? outcome.value.parentId : "x").toBeNull();
  });

  it("adds a numeric suffix when a live sibling has the same name", async () => {
    const driveId = await seedDrive(db.admin, { owner: annaOwner, name: "Personal" });
    const fileId = await seedRegularFile(db.admin, {
      driveId,
      owner: annaOwner,
      parentId: null,
      name: "report.pdf",
      sizeBytes: 1,
      createdByUserId: anna,
      trashed: true,
    });
    await seedRegularFile(db.admin, {
      driveId,
      owner: annaOwner,
      parentId: null,
      name: "report.pdf",
      sizeBytes: 1,
      createdByUserId: anna,
    });

    const outcome = await restoreFile(db.db, anna, fileId);

    expect(outcome.outcome === "found" ? outcome.value.name : "").toBe("report (2).pdf");
  });

  it("answers NOT_TRASHED for a live file and not-found for an unknown id", async () => {
    const driveId = await seedDrive(db.admin, { owner: annaOwner, name: "Personal" });
    const fileId = await seedRegularFile(db.admin, {
      driveId,
      owner: annaOwner,
      parentId: null,
      name: "a.pdf",
      sizeBytes: 1,
      createdByUserId: anna,
    });

    await expect(restoreFile(db.db, anna, fileId)).rejects.toBeInstanceOf(NotTrashedError);
    expect((await restoreFile(db.db, anna, randomUUID())).outcome).toBe("not-found");
  });

  it("keeps a child that was trashed on its own in the trash when its folder is restored", async () => {
    const driveId = await seedDrive(db.admin, { owner: annaOwner, name: "Personal" });
    const folderId = await seedFolder(db.admin, {
      driveId,
      owner: annaOwner,
      parentId: null,
      name: "Docs",
    });
    const childId = await seedRegularFile(db.admin, {
      driveId,
      owner: annaOwner,
      parentId: folderId,
      name: "a.pdf",
      sizeBytes: 1,
      createdByUserId: anna,
      trashed: true,
    });
    await trashFile(db.db, anna, folderId);

    await restoreFile(db.db, anna, folderId);

    const child = await db.admin.query<{ deleted_at: Date | null }>(
      "SELECT deleted_at FROM files.file WHERE file_id = $1",
      [childId],
    );
    expect(child.rows[0]?.deleted_at).toBeInstanceOf(Date);
  });

  it("lets a family member restore a family file", async () => {
    const driveId = await seedDrive(db.admin, { owner: familyOwner, name: "The Smiths" });
    const fileId = await seedFolder(db.admin, {
      driveId,
      owner: familyOwner,
      parentId: null,
      name: "Shared",
      trashed: true,
    });

    expect((await restoreFile(db.db, chris, fileId)).outcome).toBe("not-found");
    expect((await restoreFile(db.db, ben, fileId)).outcome).toBe("found");
  });
  it("answers NOT_TRASHED to a second restore that races the first", async () => {
    const driveId = await seedDrive(db.admin, { owner: annaOwner, name: "Personal" });
    const fileId = await seedRegularFile(db.admin, {
      driveId,
      owner: annaOwner,
      parentId: null,
      name: "a.txt",
      sizeBytes: 1,
      createdByUserId: anna,
      trashed: true,
    });
    let releaseFirst = (): void => undefined;
    const firstHeld = new Promise<void>((resolve) => {
      releaseFirst = resolve;
    });
    const first = writeAsUser(db.db, anna, async (tx) => {
      await restoreTrashedFile(tx, fileId, {
        name: "a.txt",
        parentId: null,
        updatedAt: new Date(),
      });
      await firstHeld;
    });

    const second = restoreFile(db.db, anna, fileId);
    await new Promise((resolve) => setTimeout(resolve, 300));
    releaseFirst();
    await first;

    await expect(second).rejects.toBeInstanceOf(NotTrashedError);
  });
});
