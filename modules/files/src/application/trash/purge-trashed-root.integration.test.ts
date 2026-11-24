// SPDX-FileCopyrightText: 2026 Dominik Wadowski
// SPDX-License-Identifier: FSL-1.1-ALv2

import { randomUUID } from "node:crypto";
import { createInMemoryFileStorage, type FileStorage } from "@offgrid/file-storage";
import { afterAll, beforeAll, beforeEach, describe, expect, it } from "vitest";
import { seedDrive } from "../../../test/seed-drive.js";
import { seedFolder } from "../../../test/seed-folder.js";
import { seedRegularFile } from "../../../test/seed-regular-file.js";
import { startFilesTestDatabase } from "../../../test/start-files-test-database.js";
import type { FilesTestDatabase, SeedOwner } from "../../../test/types.js";
import { lockTrashedChain } from "../../infrastructure/trash/lock-trashed-chain.js";
import { restoreTrashedFile } from "../../infrastructure/trash/restore-trashed-file.js";
import { writeAsUser } from "../write-as-user.js";
import { purgeTrashedRoot } from "./purge-trashed-root.js";
import { restoreFile } from "./restore-file.js";

const countLockWaiters = async (db: FilesTestDatabase): Promise<number> => {
  const waiting = await db.admin.query<{ waiting: number }>(
    "SELECT count(*)::int AS waiting FROM pg_stat_activity WHERE datname = current_database() AND wait_event_type = 'Lock'",
  );
  return waiting.rows[0]?.waiting ?? 0;
};

const waitUntil = async (condition: () => Promise<boolean>, timeoutMs: number): Promise<void> => {
  const deadline = Date.now() + timeoutMs;
  while (!(await condition())) {
    if (Date.now() > deadline) {
      throw new Error("The condition was not met before the timeout");
    }
    await new Promise((resolve) => setImmediate(resolve));
  }
};

describe("purgeTrashedRoot", { timeout: 60_000 }, () => {
  let db: FilesTestDatabase;
  let storage: FileStorage;
  const anna = randomUUID();
  const annaOwner: SeedOwner = { userId: anna, familyId: null };

  beforeAll(async () => {
    db = await startFilesTestDatabase();
  }, 120_000);

  afterAll(async () => {
    await db.stop();
  }, 120_000);

  beforeEach(async () => {
    await db.reset();
    storage = createInMemoryFileStorage();
  });

  it("keeps a trashed child that is restored while the purge of its folder runs", async () => {
    const driveId = await seedDrive(db.admin, { owner: annaOwner, name: "Personal" });
    const folderId = await seedFolder(db.admin, {
      driveId,
      owner: annaOwner,
      parentId: null,
      name: "Holiday",
      trashed: true,
    });
    const childId = await seedRegularFile(db.admin, {
      driveId,
      owner: annaOwner,
      parentId: folderId,
      name: "sunset.jpg",
      sizeBytes: 3,
      createdByUserId: anna,
      trashed: true,
    });
    let releaseRestore = (): void => undefined;
    const restoreHeld = new Promise<void>((resolve) => {
      releaseRestore = resolve;
    });
    let markRestoreLocked = (): void => undefined;
    const restoreLocked = new Promise<void>((resolve) => {
      markRestoreLocked = resolve;
    });
    const restoring = writeAsUser(db.db, anna, async (tx) => {
      await lockTrashedChain(tx, childId);
      markRestoreLocked();
      await restoreTrashedFile(tx, childId, {
        name: "sunset.jpg",
        parentId: null,
        updatedAt: new Date(),
      });
      await restoreHeld;
    });

    await restoreLocked;
    const purging = purgeTrashedRoot(db.db, storage, anna, folderId);
    await waitUntil(async () => (await countLockWaiters(db)) >= 1, 10_000);
    releaseRestore();
    await restoring;

    expect(await purging).toEqual({ outcome: "found", value: null });
    const survivors = await db.admin.query<{ deleted_at: Date | null }>(
      "SELECT deleted_at FROM files.file WHERE file_id = $1",
      [childId],
    );
    expect(survivors.rows).toEqual([{ deleted_at: null }]);
    const versions = await db.admin.query(
      "SELECT version_id FROM files.file_version WHERE file_id = $1",
      [childId],
    );
    expect(versions.rows).toHaveLength(1);
  });

  it("answers restored when the root is restored while its purge runs", async () => {
    const driveId = await seedDrive(db.admin, { owner: annaOwner, name: "Personal" });
    const folderId = await seedFolder(db.admin, {
      driveId,
      owner: annaOwner,
      parentId: null,
      name: "Holiday",
      trashed: true,
    });
    await seedRegularFile(db.admin, {
      driveId,
      owner: annaOwner,
      parentId: folderId,
      name: "sunset.jpg",
      sizeBytes: 3,
      createdByUserId: anna,
      trashed: true,
    });
    let releaseRestore = (): void => undefined;
    const restoreHeld = new Promise<void>((resolve) => {
      releaseRestore = resolve;
    });
    let markRestoreLocked = (): void => undefined;
    const restoreLocked = new Promise<void>((resolve) => {
      markRestoreLocked = resolve;
    });
    const restoring = writeAsUser(db.db, anna, async (tx) => {
      await lockTrashedChain(tx, folderId);
      markRestoreLocked();
      await restoreTrashedFile(tx, folderId, {
        name: "Holiday",
        parentId: null,
        updatedAt: new Date(),
      });
      await restoreHeld;
    });

    await restoreLocked;
    const purging = purgeTrashedRoot(db.db, storage, anna, folderId);
    await waitUntil(async () => (await countLockWaiters(db)) >= 1, 10_000);
    releaseRestore();
    await restoring;

    expect(await purging).toEqual({ outcome: "restored" });
    const files = await db.admin.query("SELECT file_id FROM files.file WHERE drive_id = $1", [
      driveId,
    ]);
    expect(files.rows.map((row: { file_id: string }) => row.file_id)).toContain(folderId);
  });

  it("makes a restore of a nested folder wait for the purge of its root, which keeps the folder's child out of reach", async () => {
    const driveId = await seedDrive(db.admin, { owner: annaOwner, name: "Personal" });
    const rootId = await seedFolder(db.admin, {
      driveId,
      owner: annaOwner,
      parentId: null,
      name: "Trips",
      trashed: true,
    });
    const nestedId = await seedFolder(db.admin, {
      driveId,
      owner: annaOwner,
      parentId: rootId,
      name: "Holiday",
      trashed: true,
    });
    const childId = await seedRegularFile(db.admin, {
      driveId,
      owner: annaOwner,
      parentId: nestedId,
      name: "sunset.jpg",
      sizeBytes: 3,
      createdByUserId: anna,
    });
    await db.admin.query("BEGIN");
    await db.admin.query(
      "SELECT version_id FROM files.file_version WHERE file_id = $1 FOR UPDATE",
      [childId],
    );
    const purging = purgeTrashedRoot(db.db, storage, anna, rootId);
    await waitUntil(async () => (await countLockWaiters(db)) >= 1, 10_000);
    let restoreDone = false;
    const restoring = restoreFile(db.db, anna, nestedId).finally(() => {
      restoreDone = true;
    });
    await waitUntil(async () => restoreDone || (await countLockWaiters(db)) >= 2, 10_000);
    await db.admin.query("COMMIT");

    expect(await purging).toEqual({ outcome: "found", value: null });
    expect(await restoring).toEqual({ outcome: "not-found" });
    const survivors = await db.admin.query(
      "SELECT file_id FROM files.file WHERE file_id = ANY($1::uuid[])",
      [[rootId, nestedId, childId]],
    );
    expect(survivors.rows).toEqual([]);
  });
});
