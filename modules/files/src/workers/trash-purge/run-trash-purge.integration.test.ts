// SPDX-FileCopyrightText: 2026 Dominik Wadowski
// SPDX-License-Identifier: FSL-1.1-ALv2

import { randomUUID } from "node:crypto";
import { createInMemoryFileStorage, type FileStorage } from "@offgrid/file-storage";
import type { Logger } from "@offgrid/observability";
import { afterAll, beforeAll, beforeEach, describe, expect, it, vi } from "vitest";
import { seedDrive } from "../../../test/seed-drive.js";
import { seedFolder } from "../../../test/seed-folder.js";
import { seedRegularFile } from "../../../test/seed-regular-file.js";
import { startFilesTestDatabase } from "../../../test/start-files-test-database.js";
import type { FilesTestDatabase, SeedOwner } from "../../../test/types.js";
import { runTrashPurge } from "./run-trash-purge.js";

const DAY = 24 * 60 * 60 * 1000;

const fakeLogger = () => {
  const info = vi.fn();
  const warn = vi.fn();
  const error = vi.fn();
  const logger = { debug: vi.fn(), info, warn, error } as unknown as Logger;
  return { logger, info, warn, error };
};

describe("runTrashPurge", { timeout: 120_000 }, () => {
  let db: FilesTestDatabase;
  let storage: FileStorage;
  const anna = randomUUID();
  const ben = randomUUID();
  const familyWithoutMember = randomUUID();
  const familyId = randomUUID();
  const annaOwner: SeedOwner = { userId: anna, familyId: null };
  const familyOwner: SeedOwner = { userId: null, familyId };
  const now = new Date("2026-12-01T00:00:00Z");

  beforeAll(async () => {
    db = await startFilesTestDatabase();
  }, 120_000);

  afterAll(async () => {
    await db.stop();
  }, 120_000);

  beforeEach(async () => {
    await db.reset();
    storage = createInMemoryFileStorage();
    await db.admin.query(
      "INSERT INTO files.family_membership (family_id, user_id, source_version, is_member) VALUES ($1, $2, 1, true)",
      [familyId, ben],
    );
  });

  const trashedAt = (daysAgo: number) => new Date(now.getTime() - daysAgo * DAY);

  const setDeletedAt = async (fileId: string, deletedAt: Date) => {
    await db.admin.query("UPDATE files.file SET deleted_at = $2 WHERE file_id = $1", [
      fileId,
      deletedAt,
    ]);
  };

  it("purges trashed rows older than the retention period and keeps newer ones", async () => {
    const driveId = await seedDrive(db.admin, { owner: annaOwner, name: "Personal" });
    const oldId = await seedRegularFile(db.admin, {
      driveId,
      owner: annaOwner,
      parentId: null,
      name: "old.txt",
      sizeBytes: 1,
      createdByUserId: anna,
      trashed: true,
    });
    const recentId = await seedRegularFile(db.admin, {
      driveId,
      owner: annaOwner,
      parentId: null,
      name: "recent.txt",
      sizeBytes: 1,
      createdByUserId: anna,
      trashed: true,
    });
    await setDeletedAt(oldId, trashedAt(31));
    await setDeletedAt(recentId, trashedAt(5));

    const { logger, info } = fakeLogger();
    await runTrashPurge(db.db, storage, now, 30, logger);

    const left = await db.admin.query<{ file_id: string }>(
      "SELECT file_id FROM files.file WHERE drive_id = $1",
      [driveId],
    );
    expect(left.rows.map((row) => row.file_id)).toEqual([recentId]);
    expect(info).toHaveBeenCalledWith(
      "files trash purge finished",
      expect.objectContaining({ purgedRootCount: 1, failedRootCount: 0, skippedRootCount: 0 }),
    );
  });

  it("purges family roots as a current member, and skips a family with no member, counting it", async () => {
    const familyDrive = await seedDrive(db.admin, { owner: familyOwner, name: "The Smiths" });
    const orphanDrive = await seedDrive(db.admin, {
      owner: { userId: null, familyId: familyWithoutMember },
      name: "Orphans",
    });
    const familyFile = await seedFolder(db.admin, {
      driveId: familyDrive,
      owner: familyOwner,
      parentId: null,
      name: "Shared",
      trashed: true,
    });
    const orphanFile = await seedFolder(db.admin, {
      driveId: orphanDrive,
      owner: { userId: null, familyId: familyWithoutMember },
      parentId: null,
      name: "Lost",
      trashed: true,
    });
    await setDeletedAt(familyFile, trashedAt(40));
    await setDeletedAt(orphanFile, trashedAt(40));

    const { logger, info, warn } = fakeLogger();
    await runTrashPurge(db.db, storage, now, 30, logger);

    const remaining = await db.admin.query<{ file_id: string }>(
      "SELECT file_id FROM files.file WHERE file_id = ANY($1)",
      [[familyFile, orphanFile]],
    );
    expect(remaining.rows.map((row) => row.file_id)).toEqual([orphanFile]);
    expect(info).toHaveBeenCalledWith(
      "files trash purge finished",
      expect.objectContaining({ purgedRootCount: 1, skippedRootCount: 1 }),
    );
    expect(warn).toHaveBeenCalledWith(
      "files trash purge skipped or failed some roots",
      expect.objectContaining({ skippedRootCount: 1 }),
    );
  });

  it("writes removal events with the owner ids and logs no names", async () => {
    const driveId = await seedDrive(db.admin, { owner: annaOwner, name: "Personal" });
    const fileId = await seedRegularFile(db.admin, {
      driveId,
      owner: annaOwner,
      parentId: null,
      name: "secret-name.txt",
      sizeBytes: 1,
      createdByUserId: anna,
      trashed: true,
    });
    await setDeletedAt(fileId, trashedAt(40));

    const { logger, info, warn, error } = fakeLogger();
    await runTrashPurge(db.db, storage, now, 30, logger);

    const events = await db.admin.query<{ user_id: string | null }>(
      "SELECT user_id FROM outbox.event WHERE type = 'file-removed-v1' AND payload->>'fileId' = $1",
      [fileId],
    );
    expect(events.rows).toEqual([{ user_id: anna }]);
    const logged = JSON.stringify([info.mock.calls, warn.mock.calls, error.mock.calls]);
    expect(logged.includes("secret-name")).toBe(false);
  });

  it("does nothing on a second run", async () => {
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
    await setDeletedAt(fileId, trashedAt(40));

    const first = fakeLogger();
    await runTrashPurge(db.db, storage, now, 30, first.logger);
    const second = fakeLogger();
    await runTrashPurge(db.db, storage, now, 30, second.logger);

    expect(second.info).toHaveBeenCalledWith(
      "files trash purge finished",
      expect.objectContaining({ purgedRootCount: 0 }),
    );
  });
});
