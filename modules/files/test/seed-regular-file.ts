// SPDX-FileCopyrightText: 2026 Dominik Wadowski
// SPDX-License-Identifier: FSL-1.1-ALv2

import { randomUUID } from "node:crypto";
import type { Client } from "pg";
import type { SeedRegularFileInput } from "./types.js";

export const seedRegularFile = async (
  admin: Client,
  input: SeedRegularFileInput,
): Promise<string> => {
  const fileId = randomUUID();
  const versionId = randomUUID();
  const trashedAt = input.trashed === true ? new Date() : null;
  await admin.query("BEGIN");
  await admin.query(
    `INSERT INTO files.file (file_id, drive_id, parent_id, user_id, family_id, name, is_folder, mime_type, size_bytes, current_version_id, deleted_at)
     VALUES ($1, $2, $3, $4, $5, $6, false, 'text/plain', $7, $8, $9)`,
    [
      fileId,
      input.driveId,
      input.parentId,
      input.owner.userId,
      input.owner.familyId,
      input.name,
      input.sizeBytes,
      versionId,
      trashedAt,
    ],
  );
  await admin.query(
    `INSERT INTO files.file_version
       (version_id, file_id, user_id, family_id, number, storage_key, size_bytes, mime_type, sha256, created_by_user_id)
     VALUES ($1, $2, $3, $4, 1, $5, $6, 'text/plain', $7, $8)`,
    [
      versionId,
      fileId,
      input.owner.userId,
      input.owner.familyId,
      `key-${versionId}`,
      input.sizeBytes,
      "0".repeat(64),
      input.createdByUserId,
    ],
  );
  await admin.query("COMMIT");
  return fileId;
};
