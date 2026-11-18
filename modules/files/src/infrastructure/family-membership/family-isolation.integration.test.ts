// SPDX-FileCopyrightText: 2026 Dominik Wadowski
// SPDX-License-Identifier: FSL-1.1-ALv2

import { randomUUID } from "node:crypto";
import { withUserContext } from "@offgrid/db";
import { afterAll, beforeAll, beforeEach, describe, expect, it } from "vitest";
import { startFilesTestDatabase } from "../../../test/start-files-test-database.js";
import type { FilesTestDatabase } from "../../../test/types.js";

describe("files family isolation", { timeout: 60_000 }, () => {
  let db: FilesTestDatabase;
  const familyA = randomUUID();
  const familyB = randomUUID();
  const anna = randomUUID();
  const ben = randomUUID();

  beforeAll(async () => {
    db = await startFilesTestDatabase();
  }, 120_000);

  afterAll(async () => {
    await db.stop();
  }, 120_000);

  const seedFamilyDrive = async (familyId: string, name: string) => {
    const driveId = randomUUID();
    const fileId = randomUUID();
    const versionId = randomUUID();
    await db.admin.query("BEGIN");
    await db.admin.query(
      "INSERT INTO files.drive (drive_id, family_id, kind, name) VALUES ($1, $2, 'family', $3)",
      [driveId, familyId, name],
    );
    await db.admin.query(
      `INSERT INTO files.file (file_id, drive_id, family_id, name, is_folder, mime_type, size_bytes, current_version_id)
       VALUES ($1, $2, $3, $4, false, 'text/plain', 3, $5)`,
      [fileId, driveId, familyId, `${name}.txt`, versionId],
    );
    await db.admin.query(
      `INSERT INTO files.file_version
         (version_id, file_id, family_id, number, storage_key, size_bytes, mime_type, sha256, created_by_user_id)
       VALUES ($1, $2, $3, 1, $4, 3, 'text/plain', $5, $6)`,
      [versionId, fileId, familyId, `key-${versionId}`, "0".repeat(64), randomUUID()],
    );
    await db.admin.query("COMMIT");
    return { driveId, fileId, versionId };
  };

  const readAs = <T>(
    userId: string,
    read: (tx: Parameters<Parameters<typeof db.db.$transaction>[0]>[0]) => Promise<T>,
  ) =>
    db.db.$transaction(async (tx) => {
      await withUserContext(tx, userId);
      return read(tx);
    });

  beforeEach(async () => {
    await db.reset();
    await db.admin.query(
      `INSERT INTO files.family_membership (family_id, user_id, source_version, is_member) VALUES
         ($1, $2, 1, true), ($3, $4, 1, true)`,
      [familyA, anna, familyB, ben],
    );
  });

  it("shows Anna only family A's drive, files and versions", async () => {
    const a = await seedFamilyDrive(familyA, "Alpha");
    const b = await seedFamilyDrive(familyB, "Beta");

    const drives = await readAs(anna, (tx) => tx.filesDrive.findMany());
    const files = await readAs(anna, (tx) => tx.filesFile.findMany());
    const versions = await readAs(anna, (tx) => tx.filesFileVersion.findMany());

    expect(drives.map((row) => row.driveId)).toEqual([a.driveId]);
    expect(files.map((row) => row.fileId)).toEqual([a.fileId]);
    expect(versions.map((row) => row.versionId)).toEqual([a.versionId]);
    expect(drives.map((row) => row.driveId)).not.toContain(b.driveId);
  });

  it("shows Ben only family B's drive", async () => {
    await seedFamilyDrive(familyA, "Alpha");
    const b = await seedFamilyDrive(familyB, "Beta");

    const drives = await readAs(ben, (tx) => tx.filesDrive.findMany());

    expect(drives.map((row) => row.driveId)).toEqual([b.driveId]);
  });

  it("hides family A from Anna once her removal is applied", async () => {
    await seedFamilyDrive(familyA, "Alpha");
    await db.admin.query(
      "UPDATE files.family_membership SET source_version = 2, is_member = false WHERE family_id = $1 AND user_id = $2",
      [familyA, anna],
    );

    const drives = await readAs(anna, (tx) => tx.filesDrive.findMany());
    const files = await readAs(anna, (tx) => tx.filesFile.findMany());

    expect(drives).toEqual([]);
    expect(files).toEqual([]);
  });
});
