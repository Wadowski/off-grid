// SPDX-FileCopyrightText: 2026 Dominik Wadowski
// SPDX-License-Identifier: FSL-1.1-ALv2

import { randomUUID } from "node:crypto";
import type { Client } from "pg";
import { afterAll, beforeAll, describe, expect, it } from "vitest";
import { startTestDatabase } from "../test/start-test-database.js";
import type { TestDatabase } from "../test/types.js";
import { createModuleDb, withFilesStorageSweepContext } from "./index.js";

const SWEEP_SETTING = "app.files_storage_sweep";

const seedVersionForUser = async (client: Client, userId: string, storageKey: string) => {
  const driveId = randomUUID();
  const fileId = randomUUID();
  const versionId = randomUUID();
  await client.query("BEGIN");
  await client.query(
    "INSERT INTO files.drive (drive_id, user_id, kind, name) VALUES ($1, $2, 'personal', 'Mine')",
    [driveId, userId],
  );
  await client.query(
    `INSERT INTO files.file (file_id, drive_id, user_id, name, is_folder, mime_type, size_bytes, current_version_id)
     VALUES ($1, $2, $3, 'doc.txt', false, 'text/plain', 3, $4)`,
    [fileId, driveId, userId, versionId],
  );
  await client.query(
    `INSERT INTO files.file_version
       (version_id, file_id, user_id, number, storage_key, size_bytes, mime_type, sha256, created_by_user_id)
     VALUES ($1, $2, $3, 1, $4, 3, 'text/plain', $5, $3)`,
    [versionId, fileId, userId, storageKey, "0".repeat(64)],
  );
  await client.query("COMMIT");
  return versionId;
};

const queryWithSweepSetting = async (
  client: Client,
  withSweepSetting: boolean,
  sql: string,
  params: unknown[] = [],
) => {
  await client.query("BEGIN");
  try {
    if (withSweepSetting) {
      await client.query(`SELECT set_config('${SWEEP_SETTING}', 'on', true)`);
    }
    const { rows } = await client.query(sql, params);
    await client.query("COMMIT");
    return rows;
  } catch (error) {
    await client.query("ROLLBACK");
    throw error;
  }
};

describe("files storage sweep migration", { timeout: 120_000 }, () => {
  let db: TestDatabase;
  let app: Client;
  const userA = randomUUID();
  const userB = randomUUID();
  let versionA: string;
  let versionB: string;

  beforeAll(async () => {
    db = await startTestDatabase();
    versionA = await seedVersionForUser(db.admin, userA, `sweep-a-${randomUUID()}`);
    versionB = await seedVersionForUser(db.admin, userB, `sweep-b-${randomUUID()}`);
    app = await db.connectClient();
  }, 120_000);

  afterAll(async () => {
    await app?.end();
    await db?.stop();
  });

  it("adds one SELECT policy on files.file_version named for the sweep", async () => {
    const { rows } = await db.admin.query<{ cmd: string }>(
      `SELECT cmd FROM pg_policies
        WHERE schemaname = 'files' AND tablename = 'file_version'
          AND policyname = 'file_version_storage_sweep_read'`,
    );

    expect(rows).toEqual([{ cmd: "SELECT" }]);
  });

  it("reads every owner's version rows only when the sweep setting is on", async () => {
    const withSetting = await queryWithSweepSetting(
      app,
      true,
      "SELECT version_id FROM files.file_version WHERE version_id = ANY($1) ORDER BY version_id",
      [[versionA, versionB]],
    );
    const withoutSetting = await queryWithSweepSetting(
      app,
      false,
      "SELECT version_id FROM files.file_version WHERE version_id = ANY($1)",
      [[versionA, versionB]],
    );

    expect(withSetting.map((row) => row.version_id).sort()).toEqual([versionA, versionB].sort());
    expect(withoutSetting).toEqual([]);
  });

  it("does not widen reads of any table other than files.file_version", async () => {
    const drives = await queryWithSweepSetting(app, true, "SELECT drive_id FROM files.drive");
    const files = await queryWithSweepSetting(app, true, "SELECT file_id FROM files.file");

    expect(drives).toEqual([]);
    expect(files).toEqual([]);
  });

  it("does not let the sweep write another owner's version row", async () => {
    await app.query("BEGIN");
    try {
      await app.query(`SELECT set_config('${SWEEP_SETTING}', 'on', true)`);
      await expect(
        app.query(
          `INSERT INTO files.file_version
             (version_id, file_id, user_id, number, storage_key, size_bytes, mime_type, sha256, created_by_user_id)
           VALUES ($1, $2, $3, 2, 'sweep-write', 0, 'text/plain', $4, $3)`,
          [randomUUID(), randomUUID(), userA, "0".repeat(64)],
        ),
      ).rejects.toThrow(/row-level security|foreign key/);
    } finally {
      await app.query("ROLLBACK");
    }
  });

  it("sets the sweep setting only inside its transaction", async () => {
    const prisma = createModuleDb(db.connectPool());
    try {
      const inSweep = await prisma.$transaction(async (tx) => {
        await withFilesStorageSweepContext(tx);
        return tx.filesFileVersion.findMany({ select: { versionId: true } });
      });
      const outsideSweep = await prisma.filesFileVersion.findMany({ select: { versionId: true } });

      expect(inSweep.map((row) => row.versionId).sort()).toEqual([versionA, versionB].sort());
      expect(outsideSweep).toEqual([]);
    } finally {
      await prisma.$disconnect();
    }
  });
});
