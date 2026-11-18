// SPDX-FileCopyrightText: 2026 Dominik Wadowski
// SPDX-License-Identifier: FSL-1.1-ALv2

import { randomUUID } from "node:crypto";
import type { Client } from "pg";
import { afterAll, beforeAll, beforeEach, describe, expect, it } from "vitest";
import { startTestDatabase } from "../test/start-test-database.js";
import type { TestDatabase } from "../test/types.js";
import { assertOwnershipScopes, DATABASE_SCHEMAS } from "./index.js";

type Owner = { readonly userId?: string; readonly familyId?: string };

const queryAs = async (client: Client, owner: Owner, sql: string, params: unknown[] = []) => {
  await client.query("BEGIN");
  try {
    if (owner.familyId) {
      await client.query("SELECT set_config('app.family_id', $1, true)", [owner.familyId]);
    }
    if (owner.userId) {
      await client.query("SELECT set_config('app.user_id', $1, true)", [owner.userId]);
    }
    const { rows } = await client.query(sql, params);
    await client.query("COMMIT");
    return rows;
  } catch (error) {
    await client.query("ROLLBACK");
    throw error;
  }
};

const seedMembership = (db: TestDatabase, familyId: string, userId: string, isMember: boolean) =>
  db.admin.query(
    "INSERT INTO files.family_membership (family_id, user_id, source_version, is_member) VALUES ($1, $2, 1, $3)",
    [familyId, userId, isMember],
  );

const seedFamilyFile = async (db: TestDatabase, familyId: string) => {
  const driveId = randomUUID();
  const fileId = randomUUID();
  const versionId = randomUUID();
  await db.admin.query("BEGIN");
  await db.admin.query(
    "INSERT INTO files.drive (drive_id, family_id, kind, name) VALUES ($1, $2, 'family', 'Family')",
    [driveId, familyId],
  );
  await db.admin.query(
    `INSERT INTO files.file (file_id, drive_id, family_id, name, is_folder, mime_type, size_bytes, current_version_id)
     VALUES ($1, $2, $3, 'doc.txt', false, 'text/plain', 3, $4)`,
    [fileId, driveId, familyId, versionId],
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

const countRows = async (client: Client, owner: Owner, table: string) => {
  const rows = await queryAs(client, owner, `SELECT count(*)::int AS n FROM files.${table}`);
  return rows[0]?.n;
};

describe("files family membership migration", { timeout: 120_000 }, () => {
  let db: TestDatabase;
  let app: Client;

  beforeAll(async () => {
    db = await startTestDatabase();
    app = await db.connectClient();
  }, 120_000);

  afterAll(async () => {
    await app?.end();
    await db?.stop();
  });

  beforeEach(async () => {
    await db.admin.query(
      "TRUNCATE files.file_version, files.file, files.drive, files.family_membership RESTART IDENTITY CASCADE",
    );
  });

  it("declares the membership table as family scope and passes assertOwnershipScopes", async () => {
    const { rows } = await db.admin.query<{ table_name: string }>(
      "SELECT table_name FROM information_schema.tables WHERE table_schema = 'files' ORDER BY table_name",
    );

    expect(rows.map((row) => row.table_name)).toContain("family_membership");
    await expect(assertOwnershipScopes(db.migrator, DATABASE_SCHEMAS)).resolves.toBeUndefined();
  });

  it("lets a user read only their own membership rows", async () => {
    const familyId = randomUUID();
    const userA = randomUUID();
    const userB = randomUUID();
    await seedMembership(db, familyId, userA, true);
    await seedMembership(db, familyId, userB, true);

    const rows = await queryAs(app, { userId: userA }, "SELECT user_id FROM files.family_membership");

    expect(rows).toEqual([{ user_id: userA }]);
  });

  it("shows a family drive, its files and versions to a member", async () => {
    const familyId = randomUUID();
    const member = randomUUID();
    await seedMembership(db, familyId, member, true);
    await seedFamilyFile(db, familyId);

    const owner = { userId: member };
    expect(await countRows(app, owner, "drive")).toBe(1);
    expect(await countRows(app, owner, "file")).toBe(1);
    expect(await countRows(app, owner, "file_version")).toBe(1);
  });

  it("lets a member write to the family drive and refuses a non-member", async () => {
    const familyId = randomUUID();
    const member = randomUUID();
    const outsider = randomUUID();
    await seedMembership(db, familyId, member, true);
    const { driveId } = await seedFamilyFile(db, familyId);

    await expect(
      queryAs(
        app,
        { userId: member },
        `INSERT INTO files.file (file_id, drive_id, family_id, name, is_folder)
         VALUES ($1, $2, $3, 'Notes', true)`,
        [randomUUID(), driveId, familyId],
      ),
    ).resolves.toEqual([]);
    await expect(
      queryAs(
        app,
        { userId: outsider },
        `INSERT INTO files.file (file_id, drive_id, family_id, name, is_folder)
         VALUES ($1, $2, $3, 'Sneaky', true)`,
        [randomUUID(), driveId, familyId],
      ),
    ).rejects.toThrow(/row-level security/);
  });

  it("shows nothing to a non-member, an ex-member or a user with no family", async () => {
    const familyId = randomUUID();
    const exMember = randomUUID();
    const noFamily = randomUUID();
    await seedMembership(db, familyId, exMember, false);
    await seedFamilyFile(db, familyId);

    for (const owner of [{ userId: exMember }, { userId: noFamily }]) {
      expect(await countRows(app, owner, "drive")).toBe(0);
      expect(await countRows(app, owner, "file")).toBe(0);
      expect(await countRows(app, owner, "file_version")).toBe(0);
    }
  });

  it("isolates two families: a member sees only their own family's drive", async () => {
    const familyA = randomUUID();
    const familyB = randomUUID();
    const memberA = randomUUID();
    const memberB = randomUUID();
    await seedMembership(db, familyA, memberA, true);
    await seedMembership(db, familyB, memberB, true);
    const a = await seedFamilyFile(db, familyA);
    const b = await seedFamilyFile(db, familyB);

    const drivesOfA = await queryAs(app, { userId: memberA }, "SELECT drive_id FROM files.drive");
    const versionsOfB = await queryAs(
      app,
      { userId: memberA },
      "SELECT version_id FROM files.file_version WHERE file_id = $1",
      [b.fileId],
    );

    expect(drivesOfA).toEqual([{ drive_id: a.driveId }]);
    expect(versionsOfB).toEqual([]);
    expect(await countRows(app, { userId: memberB }, "drive")).toBe(1);
  });

  it("keeps a personal drive private to its owner", async () => {
    const owner = randomUUID();
    const familyMember = randomUUID();
    const familyId = randomUUID();
    await seedMembership(db, familyId, familyMember, true);
    await db.admin.query(
      "INSERT INTO files.drive (drive_id, user_id, kind, name) VALUES ($1, $2, 'personal', 'Mine')",
      [randomUUID(), owner],
    );

    expect(await countRows(app, { userId: owner }, "drive")).toBe(1);
    expect(await countRows(app, { userId: familyMember }, "drive")).toBe(0);
  });

  it("returns null-safe membership from is_family_member for a member, an ex-member and a stranger", async () => {
    const familyId = randomUUID();
    const member = randomUUID();
    const exMember = randomUUID();
    const stranger = randomUUID();
    await seedMembership(db, familyId, member, true);
    await seedMembership(db, familyId, exMember, false);

    const check = async (userId: string) =>
      (
        await queryAs(app, { userId }, "SELECT files.is_family_member($1) AS is_member", [familyId])
      )[0]?.is_member;

    expect(await check(member)).toBe(true);
    expect(await check(exMember)).toBe(false);
    expect(await check(stranger)).toBe(false);
  });

  it("does not let offgrid_app update a file version", async () => {
    const familyId = randomUUID();
    const member = randomUUID();
    await seedMembership(db, familyId, member, true);
    const { versionId } = await seedFamilyFile(db, familyId);

    await expect(
      queryAs(app, { userId: member }, "UPDATE files.file_version SET size_bytes = 0 WHERE version_id = $1", [
        versionId,
      ]),
    ).rejects.toThrow(/permission denied/);
  });
});
