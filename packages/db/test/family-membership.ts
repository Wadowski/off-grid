// SPDX-FileCopyrightText: 2026 Dominik Wadowski
// SPDX-License-Identifier: FSL-1.1-ALv2

import { randomUUID } from "node:crypto";
import type { TestDatabase } from "./types.js";

export const seedFamilyFile = async (db: TestDatabase, familyId: string) => {
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
