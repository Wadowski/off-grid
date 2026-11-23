// SPDX-FileCopyrightText: 2026 Dominik Wadowski
// SPDX-License-Identifier: FSL-1.1-ALv2

import { randomUUID } from "node:crypto";
import type { Client } from "pg";
import { afterAll, beforeAll, describe, expect, it } from "vitest";
import { startTestDatabase } from "../test/start-test-database.js";
import type { TestDatabase } from "../test/types.js";
import { createModuleDb, withFilesTrashPurgeContext } from "./index.js";

const TRASH_PURGE_SETTING = "app.files_trash_purge";

const seedTrashedAndLiveFiles = async (client: Client, userId: string, familyId: string) => {
  const driveId = randomUUID();
  const trashedFileId = randomUUID();
  const liveFileId = randomUUID();
  await client.query("BEGIN");
  await client.query(
    "INSERT INTO files.drive (drive_id, user_id, kind, name) VALUES ($1, $2, 'personal', 'Mine')",
    [driveId, userId],
  );
  await client.query(
    `INSERT INTO files.file (file_id, drive_id, user_id, name, is_folder, mime_type, size_bytes, deleted_at)
     VALUES ($1, $2, $3, 'old.txt', false, 'text/plain', 0, now())`,
    [trashedFileId, driveId, userId],
  );
  await client.query(
    `INSERT INTO files.file (file_id, drive_id, user_id, name, is_folder, mime_type, size_bytes)
     VALUES ($1, $2, $3, 'live.txt', false, 'text/plain', 0)`,
    [liveFileId, driveId, userId],
  );
  await client.query("COMMIT");
  return { trashedFileId, liveFileId, familyId };
};

const queryWithTrashPurgeSetting = async (
  client: Client,
  withSetting: boolean,
  sql: string,
  params: unknown[] = [],
) => {
  await client.query("BEGIN");
  try {
    if (withSetting) {
      await client.query(`SELECT set_config('${TRASH_PURGE_SETTING}', 'on', true)`);
    }
    const { rows } = await client.query(sql, params);
    await client.query("COMMIT");
    return rows;
  } catch (error) {
    await client.query("ROLLBACK");
    throw error;
  }
};

describe("files trash purge migration", { timeout: 120_000 }, () => {
  let db: TestDatabase;
  let app: Client;
  const userA = randomUUID();
  const familyId = randomUUID();
  let trashedFileId: string;
  let liveFileId: string;

  beforeAll(async () => {
    db = await startTestDatabase();
    ({ trashedFileId, liveFileId } = await seedTrashedAndLiveFiles(db.admin, userA, familyId));
    await db.admin.query(
      "INSERT INTO files.family_membership (family_id, user_id, source_version, is_member) VALUES ($1, $2, 1, true)",
      [familyId, userA],
    );
    app = await db.connectClient();
  }, 120_000);

  afterAll(async () => {
    await app?.end();
    await db?.stop();
  });

  it("adds one SELECT policy on files.file and one on files.family_membership", async () => {
    const { rows } = await db.admin.query<{ tablename: string; cmd: string }>(
      `SELECT tablename, cmd FROM pg_policies
        WHERE schemaname = 'files'
          AND policyname IN ('file_trash_purge_read', 'family_membership_trash_purge_read')
        ORDER BY tablename`,
    );

    expect(rows).toEqual([
      { tablename: "family_membership", cmd: "SELECT" },
      { tablename: "file", cmd: "SELECT" },
    ]);
  });

  it("reads only trashed file rows when the setting is on", async () => {
    const withSetting = await queryWithTrashPurgeSetting(
      app,
      true,
      "SELECT file_id FROM files.file WHERE file_id = ANY($1) ORDER BY file_id",
      [[trashedFileId, liveFileId]],
    );
    const withoutSetting = await queryWithTrashPurgeSetting(
      app,
      false,
      "SELECT file_id FROM files.file WHERE file_id = ANY($1)",
      [[trashedFileId, liveFileId]],
    );

    expect(withSetting.map((row) => row.file_id)).toEqual([trashedFileId]);
    expect(withoutSetting).toEqual([]);
  });

  it("reads only member rows of family_membership when the setting is on", async () => {
    const withSetting = await queryWithTrashPurgeSetting(
      app,
      true,
      "SELECT family_id FROM files.family_membership WHERE family_id = $1",
      [familyId],
    );

    expect(withSetting).toEqual([{ family_id: familyId }]);
  });

  it("does not let the setting write a file row", async () => {
    await app.query("BEGIN");
    try {
      await app.query(`SELECT set_config('${TRASH_PURGE_SETTING}', 'on', true)`);
      await expect(
        app.query("DELETE FROM files.file WHERE file_id = $1", [trashedFileId]),
      ).resolves.toMatchObject({ rowCount: 0 });
    } finally {
      await app.query("ROLLBACK");
    }
  });

  it("sets the trash purge setting only inside its transaction", async () => {
    const prisma = createModuleDb(db.connectPool());
    try {
      const inPurge = await prisma.$transaction(async (tx) => {
        await withFilesTrashPurgeContext(tx);
        return tx.filesFile.findMany({ select: { fileId: true } });
      });
      const outsidePurge = await prisma.filesFile.findMany({ select: { fileId: true } });

      expect(inPurge.map((row) => row.fileId)).toEqual([trashedFileId]);
      expect(outsidePurge).toEqual([]);
    } finally {
      await prisma.$disconnect();
    }
  });
});
