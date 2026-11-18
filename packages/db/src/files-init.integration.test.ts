// SPDX-FileCopyrightText: 2026 Dominik Wadowski
// SPDX-License-Identifier: FSL-1.1-ALv2

import { randomUUID } from "node:crypto";
import type { Client } from "pg";
import { afterAll, beforeAll, describe, expect, it } from "vitest";
import { startTestDatabase } from "../test/start-test-database.js";
import type { Context, FileInput, TestDatabase } from "../test/types.js";
import {
  assertOwnershipScopes,
  createModuleDb,
  DATABASE_SCHEMAS,
  withUserContext,
} from "./index.js";

const queryAs = async (client: Client, context: Context, sql: string, params: unknown[] = []) => {
  await client.query("BEGIN");
  try {
    if (context.familyId) {
      await client.query("SELECT set_config('app.family_id', $1, true)", [context.familyId]);
    }
    if (context.userId) {
      await client.query("SELECT set_config('app.user_id', $1, true)", [context.userId]);
    }
    const { rows } = await client.query(sql, params);
    await client.query("COMMIT");
    return rows;
  } catch (error) {
    await client.query("ROLLBACK");
    throw error;
  }
};

const ownerColumns = (owner: Context) => [owner.familyId ?? null, owner.userId ?? null];

const insertDrive = async (
  client: Client,
  owner: Context,
  kind: "personal" | "family",
  name = "Files",
): Promise<string> => {
  const driveId = randomUUID();
  await client.query(
    "INSERT INTO files.drive (drive_id, family_id, user_id, kind, name) VALUES ($1, $2, $3, $4, $5)",
    [driveId, ...ownerColumns(owner), kind, name],
  );
  return driveId;
};

const insertFile = async (client: Client, input: FileInput): Promise<string> => {
  const fileId = randomUUID();
  const isFolder = input.isFolder ?? true;
  await client.query(
    `INSERT INTO files.file
       (file_id, drive_id, parent_id, family_id, user_id, name, is_folder, mime_type, size_bytes, current_version_id)
     VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)`,
    [
      fileId,
      input.driveId,
      input.parentId ?? null,
      ...ownerColumns(input.owner),
      input.name,
      isFolder,
      isFolder ? null : (input.mimeType ?? "text/plain"),
      isFolder ? null : (input.sizeBytes ?? 0),
      input.currentVersionId ?? null,
    ],
  );
  return fileId;
};

const insertVersion = async (
  client: Client,
  fileId: string,
  owner: Context,
  number = 1,
): Promise<string> => {
  const versionId = randomUUID();
  await client.query(
    `INSERT INTO files.file_version
       (version_id, file_id, family_id, user_id, number, storage_key, size_bytes, mime_type, sha256, created_by_user_id)
     VALUES ($1, $2, $3, $4, $5, $6, 0, 'text/plain', $7, $8)`,
    [
      versionId,
      fileId,
      ...ownerColumns(owner),
      number,
      `key-${versionId}`,
      "0".repeat(64),
      owner.userId ?? randomUUID(),
    ],
  );
  return versionId;
};

describe("files init migration", () => {
  let db: TestDatabase;

  const userA = randomUUID();
  const userB = randomUUID();
  const familyF = randomUUID();

  beforeAll(async () => {
    db = await startTestDatabase();
  }, 120_000);

  afterAll(async () => {
    await db?.stop();
  });

  it("declares family-or-user on the three tables and passes assertOwnershipScopes", async () => {
    const { rows } = await db.admin.query<{ table_name: string }>(
      "SELECT table_name FROM information_schema.tables WHERE table_schema = 'files' ORDER BY table_name",
    );
    expect(rows.map((row) => row.table_name)).toEqual(["drive", "file", "file_version"]);
    await expect(assertOwnershipScopes(db.migrator, DATABASE_SCHEMAS)).resolves.toBeUndefined();
  });

  it("rejects a row with both owners or neither on each table", async () => {
    const bothOwners = [randomUUID(), familyF, userA];
    const noOwner = [randomUUID(), null, null];
    const driveId = randomUUID();

    await expect(
      db.migrator.query(
        "INSERT INTO files.drive (drive_id, family_id, user_id, kind, name) VALUES ($1, $2, $3, 'personal', 'x')",
        bothOwners,
      ),
    ).rejects.toThrow(/drive_one_owner/);
    await expect(
      db.migrator.query(
        "INSERT INTO files.drive (drive_id, family_id, user_id, kind, name) VALUES ($1, $2, $3, 'family', 'x')",
        noOwner,
      ),
    ).rejects.toThrow(/drive_one_owner/);

    await expect(
      db.migrator.query(
        "INSERT INTO files.file (file_id, drive_id, family_id, user_id, name, is_folder) VALUES ($1, $2, $3, $4, 'x', true)",
        [randomUUID(), driveId, familyF, userA],
      ),
    ).rejects.toThrow(/file_one_owner/);
    await expect(
      db.migrator.query(
        "INSERT INTO files.file (file_id, drive_id, family_id, user_id, name, is_folder) VALUES ($1, $2, $3, $4, 'x', true)",
        [randomUUID(), driveId, null, null],
      ),
    ).rejects.toThrow(/file_one_owner/);

    const fileId = randomUUID();
    await expect(
      db.migrator.query(
        `INSERT INTO files.file_version
           (version_id, file_id, family_id, user_id, number, storage_key, size_bytes, mime_type, sha256, created_by_user_id)
         VALUES ($1, $2, $3, $4, 1, 'k', 0, 'text/plain', $5, $6)`,
        [randomUUID(), fileId, familyF, userA, "0".repeat(64), userA],
      ),
    ).rejects.toThrow(/file_version_one_owner/);
    await expect(
      db.migrator.query(
        `INSERT INTO files.file_version
           (version_id, file_id, family_id, user_id, number, storage_key, size_bytes, mime_type, sha256, created_by_user_id)
         VALUES ($1, $2, $3, $4, 1, 'k', 0, 'text/plain', $5, $6)`,
        [randomUUID(), fileId, null, null, "0".repeat(64), userA],
      ),
    ).rejects.toThrow(/file_version_one_owner/);
  });

  it("isolates owners under row level security for offgrid_app", async () => {
    const setupClient = db.admin;
    const driveA = await insertDrive(setupClient, { userId: userA }, "personal", "A");
    const privateFileA = await insertFile(setupClient, {
      driveId: driveA,
      owner: { userId: userA },
      name: "private.txt",
      isFolder: false,
    });
    const familyDrive = await insertDrive(setupClient, { familyId: familyF }, "family", "F");
    const familyFolder = await insertFile(setupClient, {
      driveId: familyDrive,
      owner: { familyId: familyF },
      name: "shared",
    });

    const client = await db.connectClient();
    try {
      const otherUserRows = await queryAs(
        client,
        { userId: userB },
        "SELECT drive_id FROM files.drive WHERE drive_id = $1",
        [driveA],
      );
      expect(otherUserRows).toEqual([]);

      await expect(
        queryAs(
          client,
          { userId: userB },
          "INSERT INTO files.drive (drive_id, user_id, kind, name) VALUES ($1, $2, 'personal', 'x')",
          [randomUUID(), userA],
        ),
      ).rejects.toThrow(/row-level security/);

      const noContextRows = await queryAs(client, {}, "SELECT file_id FROM files.file");
      expect(noContextRows).toEqual([]);

      const otherFamilyRows = await queryAs(
        client,
        { familyId: randomUUID() },
        "SELECT file_id FROM files.file WHERE file_id = $1",
        [familyFolder],
      );
      expect(otherFamilyRows).toEqual([]);

      const memberRows = await queryAs(
        client,
        { familyId: familyF },
        "SELECT file_id FROM files.file WHERE file_id = $1",
        [familyFolder],
      );
      expect(memberRows).toEqual([{ file_id: familyFolder }]);

      const sameFamilyOtherMemberRows = await queryAs(
        client,
        { familyId: familyF, userId: userB },
        "SELECT file_id FROM files.file WHERE file_id = $1",
        [privateFileA],
      );
      expect(sameFamilyOtherMemberRows).toEqual([]);

      const ownerRows = await queryAs(
        client,
        { userId: userA },
        "SELECT file_id FROM files.file WHERE file_id = $1",
        [privateFileA],
      );
      expect(ownerRows).toEqual([{ file_id: privateFileA }]);
    } finally {
      await client.end();
    }
  });

  it("refuses a file whose owner differs from its drive and a version whose owner differs from its file", async () => {
    const driveA = await db.admin.query<{ drive_id: string }>(
      "SELECT drive_id FROM files.drive WHERE user_id = $1",
      [userA],
    );
    const driveAId = driveA.rows[0]?.drive_id ?? "";
    const familyDrive = await db.admin.query<{ drive_id: string }>(
      "SELECT drive_id FROM files.drive WHERE family_id = $1",
      [familyF],
    );
    const familyDriveId = familyDrive.rows[0]?.drive_id ?? "";

    await expect(
      insertFile(db.admin, {
        driveId: familyDriveId,
        owner: { userId: userA },
        name: "wrong-owner",
      }),
    ).rejects.toThrow(/foreign key/);

    const fileA = await insertFile(db.admin, {
      driveId: driveAId,
      owner: { userId: userA },
      name: "versioned.txt",
      isFolder: false,
    });
    await expect(insertVersion(db.admin, fileA, { familyId: familyF })).rejects.toThrow(
      /foreign key/,
    );
  });

  it("refuses a parent folder from another drive", async () => {
    const driveA = await db.admin.query<{ drive_id: string }>(
      "SELECT drive_id FROM files.drive WHERE user_id = $1",
      [userA],
    );
    const familyDrive = await db.admin.query<{ drive_id: string }>(
      "SELECT drive_id FROM files.drive WHERE family_id = $1",
      [familyF],
    );
    const parentInA = await insertFile(db.admin, {
      driveId: driveA.rows[0]?.drive_id ?? "",
      owner: { userId: userA },
      name: "parent-in-a",
    });

    await expect(
      insertFile(db.admin, {
        driveId: familyDrive.rows[0]?.drive_id ?? "",
        owner: { familyId: familyF },
        name: "child",
        parentId: parentInA,
      }),
    ).rejects.toThrow(/foreign key/);
  });

  it("enforces case-insensitive unique names among live siblings, including at the root", async () => {
    const userC = randomUUID();
    const driveC = await insertDrive(db.admin, { userId: userC }, "personal");
    const rootReport = await insertFile(db.admin, {
      driveId: driveC,
      owner: { userId: userC },
      name: "Report.pdf",
      isFolder: false,
    });

    await expect(
      insertFile(db.admin, {
        driveId: driveC,
        owner: { userId: userC },
        name: "report.PDF",
        isFolder: false,
      }),
    ).rejects.toThrow(/file_name_per_parent_idx/);

    const folder = await insertFile(db.admin, {
      driveId: driveC,
      owner: { userId: userC },
      name: "Docs",
    });
    await expect(
      insertFile(db.admin, {
        driveId: driveC,
        owner: { userId: userC },
        name: "REPORT.pdf",
        parentId: folder,
        isFolder: false,
      }),
    ).resolves.toEqual(expect.any(String));

    await db.admin.query("UPDATE files.file SET deleted_at = now() WHERE file_id = $1", [
      rootReport,
    ]);
    await expect(
      insertFile(db.admin, {
        driveId: driveC,
        owner: { userId: userC },
        name: "report.PDF",
        isFolder: false,
      }),
    ).resolves.toEqual(expect.any(String));
  });

  it("refuses a folder with size or mime type and a file without them, and refuses names with a slash", async () => {
    const userD = randomUUID();
    const driveD = await insertDrive(db.admin, { userId: userD }, "personal");

    await expect(
      db.admin.query(
        `INSERT INTO files.file (file_id, drive_id, user_id, name, is_folder, size_bytes)
         VALUES ($1, $2, $3, 'folder', true, 10)`,
        [randomUUID(), driveD, userD],
      ),
    ).rejects.toThrow(/violates check constraint/);
    await expect(
      db.admin.query(
        `INSERT INTO files.file (file_id, drive_id, user_id, name, is_folder)
         VALUES ($1, $2, $3, 'no-type', false)`,
        [randomUUID(), driveD, userD],
      ),
    ).rejects.toThrow(/violates check constraint/);
    await expect(
      insertFile(db.admin, { driveId: driveD, owner: { userId: userD }, name: "a/b" }),
    ).rejects.toThrow(/violates check constraint/);
  });

  it("commits a file, its first version and the pointer in one transaction, and refuses a dangling pointer", async () => {
    const userE = randomUUID();
    const driveE = await insertDrive(db.admin, { userId: userE }, "personal");
    const fileId = randomUUID();
    const versionId = randomUUID();

    await db.admin.query("BEGIN");
    await db.admin.query(
      `INSERT INTO files.file (file_id, drive_id, user_id, name, is_folder, mime_type, size_bytes, current_version_id)
       VALUES ($1, $2, $3, 'ok.txt', false, 'text/plain', 0, $4)`,
      [fileId, driveE, userE, versionId],
    );
    await db.admin.query(
      `INSERT INTO files.file_version
         (version_id, file_id, user_id, number, storage_key, size_bytes, mime_type, sha256, created_by_user_id)
       VALUES ($1, $2, $3, 1, 'k-ok', 0, 'text/plain', $4, $3)`,
      [versionId, fileId, userE, "0".repeat(64)],
    );
    await db.admin.query("COMMIT");

    const pointer = await db.admin.query<{ current_version_id: string }>(
      "SELECT current_version_id FROM files.file WHERE file_id = $1",
      [fileId],
    );
    expect(pointer.rows[0]?.current_version_id).toBe(versionId);

    await db.admin.query("BEGIN");
    await db.admin.query(
      `INSERT INTO files.file (file_id, drive_id, user_id, name, is_folder, mime_type, size_bytes, current_version_id)
       VALUES ($1, $2, $3, 'dangling.txt', false, 'text/plain', 0, $4)`,
      [randomUUID(), driveE, userE, randomUUID()],
    );
    await expect(db.admin.query("COMMIT")).rejects.toThrow(/file_current_version_fk/);
    await db.admin.query("ROLLBACK").catch(() => undefined);
  });

  it("lets offgrid_app insert and delete file versions but not update them", async () => {
    const userG = randomUUID();
    const driveG = await insertDrive(db.admin, { userId: userG }, "personal");
    const fileG = await insertFile(db.admin, {
      driveId: driveG,
      owner: { userId: userG },
      name: "immutable.txt",
      isFolder: false,
    });
    const existingVersion = await insertVersion(db.admin, fileG, { userId: userG }, 1);

    const client = await db.connectClient();
    try {
      const context = { userId: userG };
      await expect(
        queryAs(
          client,
          context,
          "UPDATE files.file_version SET mime_type = 'image/png' WHERE version_id = $1",
          [existingVersion],
        ),
      ).rejects.toThrow(/permission denied/);

      const createdVersion = randomUUID();
      await expect(
        queryAs(
          client,
          context,
          `INSERT INTO files.file_version
             (version_id, file_id, user_id, number, storage_key, size_bytes, mime_type, sha256, created_by_user_id)
           VALUES ($1, $2, $3, 2, 'k-app', 0, 'text/plain', $4, $3)`,
          [createdVersion, fileG, userG, "0".repeat(64)],
        ),
      ).resolves.toEqual([]);

      await expect(
        queryAs(client, context, "DELETE FROM files.file_version WHERE version_id = $1", [
          createdVersion,
        ]),
      ).resolves.toEqual([]);
    } finally {
      await client.end();
    }
  });

  it("allows one personal drive per user and one family drive per family", async () => {
    const userH = randomUUID();
    await insertDrive(db.admin, { userId: userH }, "personal");
    await expect(insertDrive(db.admin, { userId: userH }, "personal")).rejects.toThrow(
      /duplicate key/,
    );

    const familyH = randomUUID();
    await insertDrive(db.admin, { familyId: familyH }, "family");
    await expect(insertDrive(db.admin, { familyId: familyH }, "family")).rejects.toThrow(
      /duplicate key/,
    );
  });

  it("creates the listing, name and deleted_at indexes", async () => {
    const { rows } = await db.admin.query<{ indexname: string; indexdef: string }>(
      "SELECT indexname, indexdef FROM pg_indexes WHERE schemaname = 'files' AND indexname IN ('file_children_idx', 'file_name_per_parent_idx', 'file_deleted_at_idx')",
    );
    const byName = new Map(rows.map((row) => [row.indexname, row.indexdef]));
    expect(byName.get("file_children_idx")).toContain("(drive_id, parent_id, name)");
    expect(byName.get("file_name_per_parent_idx")).toContain("UNIQUE");
    expect(byName.get("file_deleted_at_idx")).toContain("WHERE (deleted_at IS NOT NULL)");
  });

  it("round-trips FilesFile through the Prisma client with a BigInt size", async () => {
    const userP = randomUUID();
    const prisma = createModuleDb(db.connectPool());
    try {
      const sizeBytes = BigInt(5_000_000_000);
      const readBack = await prisma.$transaction(async (tx) => {
        await withUserContext(tx, userP);
        const drive = await tx.filesDrive.create({
          data: { driveId: randomUUID(), userId: userP, kind: "personal", name: "Mine" },
        });
        const file = await tx.filesFile.create({
          data: {
            fileId: randomUUID(),
            driveId: drive.driveId,
            userId: userP,
            name: "big.bin",
            isFolder: false,
            mimeType: "application/octet-stream",
            sizeBytes,
          },
        });
        return tx.filesFile.findUnique({ where: { fileId: file.fileId } });
      });
      expect(readBack?.sizeBytes).toBe(sizeBytes);
      expect(readBack?.name).toBe("big.bin");
    } finally {
      await prisma.$disconnect();
    }
  });
});
