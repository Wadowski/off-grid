// SPDX-FileCopyrightText: 2026 Dominik Wadowski
// SPDX-License-Identifier: FSL-1.1-ALv2

import { randomUUID } from "node:crypto";
import { afterAll, beforeAll, beforeEach, describe, expect, it } from "vitest";
import { seedDrive } from "../../../test/seed-drive.js";
import { seedFolder } from "../../../test/seed-folder.js";
import { seedRegularFile } from "../../../test/seed-regular-file.js";
import { startFilesTestDatabase } from "../../../test/start-files-test-database.js";
import type { FilesTestDatabase, SeedOwner } from "../../../test/types.js";
import { createInMemoryFileStorage } from "@offgrid/file-storage";
import { bodyOf } from "../../../test/version-fixtures.js";
import { trashFile } from "./trash-file.js";
import { listDriveChildren } from "../files/list-drive-children.js";
import { getFileDetails } from "../files/get-file-details.js";
import { moveFile } from "../files/move-file.js";
import { openFileContent } from "../files/open-file-content.js";
import { renameFile } from "../files/rename-file.js";
import { uploadFile } from "../files/upload-file.js";

describe("trashFile", { timeout: 60_000 }, () => {
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

  it("sets deleted_at on the selected row only and bumps its version", async () => {
    const driveId = await seedDrive(db.admin, { owner: annaOwner, name: "Personal" });
    const folderId = await seedFolder(db.admin, {
      driveId,
      owner: annaOwner,
      parentId: null,
      name: "Holiday",
    });
    const childId = await seedRegularFile(db.admin, {
      driveId,
      owner: annaOwner,
      parentId: folderId,
      name: "sunset.jpg",
      sizeBytes: 3,
      createdByUserId: anna,
    });

    const outcome = await trashFile(db.db, anna, folderId);

    expect(outcome.outcome).toBe("found");
    const rows = await db.admin.query<{
      file_id: string;
      deleted_at: Date | null;
      version: number;
    }>(
      "SELECT file_id, deleted_at, version FROM files.file WHERE file_id = ANY($1) ORDER BY file_id",
      [[folderId, childId]],
    );
    const folder = rows.rows.find((row) => row.file_id === folderId);
    const child = rows.rows.find((row) => row.file_id === childId);
    expect(folder?.deleted_at).toBeInstanceOf(Date);
    expect(folder?.version).toBe(2);
    expect(child?.deleted_at).toBeNull();
    expect(child?.version).toBe(1);
  });

  it("publishes one file-updated event carrying deletedAt", async () => {
    const driveId = await seedDrive(db.admin, { owner: annaOwner, name: "Personal" });
    const fileId = await seedRegularFile(db.admin, {
      driveId,
      owner: annaOwner,
      parentId: null,
      name: "a.txt",
      sizeBytes: 1,
      createdByUserId: anna,
    });

    await trashFile(db.db, anna, fileId);

    const events = await db.admin.query<{ type: string; payload: { deletedAt: string | null } }>(
      "SELECT type, payload FROM outbox.event WHERE type = 'file-updated-v1' AND payload->>'fileId' = $1",
      [fileId],
    );
    expect(events.rows).toHaveLength(1);
    expect(events.rows[0]?.payload.deletedAt).not.toBeNull();
  });

  it("hides the trashed folder and its children from browsing", async () => {
    const driveId = await seedDrive(db.admin, { owner: annaOwner, name: "Personal" });
    const folderId = await seedFolder(db.admin, {
      driveId,
      owner: annaOwner,
      parentId: null,
      name: "Holiday",
    });
    await trashFile(db.db, anna, folderId);

    const listed = await listDriveChildren(db.db, anna, driveId, { cursor: null, limit: 50 });
    const details = await getFileDetails(db.db, anna, folderId);

    expect(listed.outcome === "found" ? listed.value.page.records : []).toEqual([]);
    expect(details.outcome).toBe("not-found");
  });

  it("answers not-found for an already trashed or unknown id", async () => {
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

    expect((await trashFile(db.db, anna, fileId)).outcome).toBe("not-found");
    expect((await trashFile(db.db, anna, randomUUID())).outcome).toBe("not-found");
  });

  it("lets a family member trash a family file and hides it from a non-member", async () => {
    const driveId = await seedDrive(db.admin, { owner: familyOwner, name: "The Smiths" });
    const fileId = await seedFolder(db.admin, {
      driveId,
      owner: familyOwner,
      parentId: null,
      name: "Shared",
    });

    expect((await trashFile(db.db, chris, fileId)).outcome).toBe("not-found");
    expect((await trashFile(db.db, ben, fileId)).outcome).toBe("found");
  });

  it("answers not-found for a trashed descendant on download, rename, move and upload", async () => {
    const driveId = await seedDrive(db.admin, { owner: annaOwner, name: "Personal" });
    const folderId = await seedFolder(db.admin, {
      driveId,
      owner: annaOwner,
      parentId: null,
      name: "Holiday",
    });
    const targetId = await seedFolder(db.admin, {
      driveId,
      owner: annaOwner,
      parentId: null,
      name: "Archive",
    });
    const childId = await seedRegularFile(db.admin, {
      driveId,
      owner: annaOwner,
      parentId: folderId,
      name: "sunset.jpg",
      sizeBytes: 3,
      createdByUserId: anna,
    });
    await trashFile(db.db, anna, folderId);
    const storage = createInMemoryFileStorage();

    expect(
      (
        await openFileContent({ db: db.db, storage }, anna, {
          fileId: childId,
          versionId: null,
          rangeHeader: undefined,
        })
      ).outcome,
    ).toBe("not-found");
    expect((await renameFile(db.db, anna, childId, "renamed.jpg")).outcome).toBe("not-found");
    expect(
      (await moveFile(db.db, storage, anna, childId, { driveId, parentId: targetId })).outcome,
    ).toBe("not-found");
    expect(
      (
        await uploadFile({ db: db.db, storage, maxUploadBytes: 1024 }, anna, {
          driveId,
          parentId: folderId,
          name: "new.txt",
          mimeType: "text/plain",
          body: bodyOf("late"),
          signal: new AbortController().signal,
        })
      ).outcome,
    ).toBe("not-found");
  });
});
