// SPDX-FileCopyrightText: 2026 Dominik Wadowski
// SPDX-License-Identifier: FSL-1.1-ALv2

import { randomUUID } from "node:crypto";
import type { Client } from "pg";
import type { FamilyMembershipRow } from "./types.js";

export const readFamilyMembership = async (
  admin: Client,
  familyId: string,
  userId: string,
): Promise<FamilyMembershipRow | undefined> => {
  const { rows } = await admin.query<FamilyMembershipRow>(
    "SELECT source_version, is_member FROM files.family_membership WHERE family_id = $1 AND user_id = $2",
    [familyId, userId],
  );
  return rows[0];
};

export const seedFamilyDrive = async (admin: Client, familyId: string, name: string) => {
  const driveId = randomUUID();
  const fileId = randomUUID();
  const versionId = randomUUID();
  await admin.query("BEGIN");
  await admin.query(
    "INSERT INTO files.drive (drive_id, family_id, kind, name) VALUES ($1, $2, 'family', $3)",
    [driveId, familyId, name],
  );
  await admin.query(
    `INSERT INTO files.file (file_id, drive_id, family_id, name, is_folder, mime_type, size_bytes, current_version_id)
     VALUES ($1, $2, $3, $4, false, 'text/plain', 3, $5)`,
    [fileId, driveId, familyId, `${name}.txt`, versionId],
  );
  await admin.query(
    `INSERT INTO files.file_version
       (version_id, file_id, family_id, number, storage_key, size_bytes, mime_type, sha256, created_by_user_id)
     VALUES ($1, $2, $3, 1, $4, 3, 'text/plain', $5, $6)`,
    [versionId, fileId, familyId, `key-${versionId}`, "0".repeat(64), randomUUID()],
  );
  await admin.query("COMMIT");
  return { driveId, fileId, versionId };
};
