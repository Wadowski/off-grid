// SPDX-FileCopyrightText: 2026 Dominik Wadowski
// SPDX-License-Identifier: FSL-1.1-ALv2

import { randomUUID } from "node:crypto";
import { mkdir, utimes, writeFile } from "node:fs/promises";
import { join } from "node:path";
import { Readable } from "node:stream";
import type { Client } from "pg";
import { afterAll, afterEach, beforeAll, beforeEach, describe, expect, it } from "vitest";
import { createDiskFileStorage } from "../../infrastructure/storage/disk-file-storage.js";
import { startFilesTestDatabase } from "../../../test/start-files-test-database.js";
import { createStorageRoot, createTemporaryDirectory, removeDirectory } from "../../../test/temp-fixture.js";
import type { FilesTestDatabase, SeedScope } from "../../../test/types.js";
import type { FileStorage } from "../../types.js";
import { generateStorageKey } from "./generate-storage-key.js";
import { checkStorageIntegrity } from "./check-storage-integrity.js";

const HOUR_MS = 60 * 60 * 1000;
const NOW = new Date("2026-12-01T12:00:00Z");
const OLD = new Date(NOW.getTime() - 2 * HOUR_MS);
const YOUNG = new Date(NOW.getTime() - 10 * 60 * 1000);

const seedVersion = async (client: Client, scope: SeedScope, storageKey: string): Promise<void> => {
  const ownerId = randomUUID();
  const createdBy = randomUUID();
  const userId = scope === "user" ? ownerId : null;
  const familyId = scope === "family" ? ownerId : null;
  const driveId = randomUUID();
  const fileId = randomUUID();
  const versionId = randomUUID();
  await client.query("BEGIN");
  await client.query(
    "INSERT INTO files.drive (drive_id, family_id, user_id, kind, name) VALUES ($1, $2, $3, $4, 'Files')",
    [driveId, familyId, userId, scope === "user" ? "personal" : "family"],
  );
  await client.query(
    `INSERT INTO files.file (file_id, drive_id, family_id, user_id, name, is_folder, mime_type, size_bytes, current_version_id)
     VALUES ($1, $2, $3, $4, 'doc.txt', false, 'text/plain', 3, $5)`,
    [fileId, driveId, familyId, userId, versionId],
  );
  await client.query(
    `INSERT INTO files.file_version
       (version_id, file_id, family_id, user_id, number, storage_key, size_bytes, mime_type, sha256, created_by_user_id)
     VALUES ($1, $2, $3, $4, 1, $5, 3, 'text/plain', $6, $7)`,
    [versionId, fileId, familyId, userId, storageKey, "0".repeat(64), createdBy],
  );
  await client.query("COMMIT");
};

const pathOfKey = (root: string, key: string): string =>
  join(root, key.slice(0, 2), key.slice(2, 4), key);

const putObject = async (storage: FileStorage, root: string, at: Date): Promise<string> => {
  const stored = await storage.put(Readable.from([Buffer.from("object bytes")]));
  await utimes(pathOfKey(root, stored.key), at, at);
  return stored.key;
};

const runSweep = (db: FilesTestDatabase, storage: FileStorage, batchSize?: number) =>
  checkStorageIntegrity(db.db, storage, NOW, batchSize);

describe("storage integrity sweep", { timeout: 120_000 }, () => {
  let db: FilesTestDatabase;
  let base: string;
  let root: string;
  let storage: FileStorage;

  beforeAll(async () => {
    db = await startFilesTestDatabase();
  }, 120_000);

  afterAll(async () => {
    await db?.stop();
  });

  beforeEach(async () => {
    await db.reset();
    base = await createTemporaryDirectory();
    root = await createStorageRoot(base);
    storage = createDiskFileStorage(root);
  });

  afterEach(async () => {
    await removeDirectory(base);
  });

  it("reports nothing when every object has a version row and every row has bytes", async () => {
    const key = await putObject(storage, root, OLD);
    await seedVersion(db.admin, "user", key);

    const report = await runSweep(db, storage);

    expect(report).toMatchObject({
      orphanKeys: [],
      missingKeys: [],
      orphanCount: 0,
      missingCount: 0,
      checkedRowCount: 1,
      checkedObjectCount: 1,
    });
  });

  it("reports an object older than the grace period with no version row, and deletes nothing", async () => {
    const orphan = await putObject(storage, root, OLD);

    const report = await runSweep(db, storage);

    expect(report.orphanKeys).toEqual([orphan]);
    expect(report.orphanCount).toBe(1);
    expect(await storage.exists(orphan)).toBe(true);
  });

  it("skips an object younger than the grace period, since its row may not be committed yet", async () => {
    await putObject(storage, root, YOUNG);

    const report = await runSweep(db, storage);

    expect(report.orphanKeys).toEqual([]);
    expect(report.orphanCount).toBe(0);
    expect(report.checkedObjectCount).toBe(1);
  });

  it("reports a version row whose bytes are gone as missing, once per key", async () => {
    const missingKey = generateStorageKey();
    await seedVersion(db.admin, "user", missingKey);
    await seedVersion(db.admin, "family", missingKey);

    const report = await runSweep(db, storage);

    expect(report.missingKeys).toEqual([missingKey]);
    expect(report.missingCount).toBe(1);
    expect(report.checkedRowCount).toBe(1);
  });

  it("ignores files in the temp folder even when they are old", async () => {
    await mkdir(join(root, ".tmp"), { recursive: true });
    const partial = join(root, ".tmp", "stale.part");
    await writeFile(partial, "partial upload");
    await utimes(partial, OLD, OLD);

    const report = await runSweep(db, storage);

    expect(report.orphanKeys).toEqual([]);
    expect(report.checkedObjectCount).toBe(0);
  });

  it("checks rows and objects across several batches, across users and families", async () => {
    const batchSize = 2;
    const healthyKeys: string[] = [];
    for (let index = 0; index < 3; index += 1) {
      const key = await putObject(storage, root, OLD);
      healthyKeys.push(key);
      await seedVersion(db.admin, index % 2 === 0 ? "user" : "family", key);
    }
    const orphanKeys: string[] = [];
    for (let index = 0; index < 3; index += 1) {
      orphanKeys.push(await putObject(storage, root, OLD));
    }
    const missingKeys = [generateStorageKey(), generateStorageKey(), generateStorageKey()];
    for (const key of missingKeys) {
      await seedVersion(db.admin, "user", key);
    }

    const report = await runSweep(db, storage, batchSize);

    expect([...report.orphanKeys].sort()).toEqual([...orphanKeys].sort());
    expect([...report.missingKeys].sort()).toEqual([...missingKeys].sort());
    expect(report.checkedRowCount).toBe(6);
    expect(report.checkedObjectCount).toBe(6);
  });
});
