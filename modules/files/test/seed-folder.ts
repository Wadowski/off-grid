// SPDX-FileCopyrightText: 2026 Dominik Wadowski
// SPDX-License-Identifier: FSL-1.1-ALv2

import { randomUUID } from "node:crypto";
import type { Client } from "pg";
import type { SeedEntryInput } from "./types.js";

export const seedFolder = async (admin: Client, input: SeedEntryInput): Promise<string> => {
  const fileId = randomUUID();
  await admin.query(
    `INSERT INTO files.file (file_id, drive_id, parent_id, user_id, family_id, name, is_folder, deleted_at)
     VALUES ($1, $2, $3, $4, $5, $6, true, $7)`,
    [
      fileId,
      input.driveId,
      input.parentId,
      input.owner.userId,
      input.owner.familyId,
      input.name,
      input.trashed === true ? new Date() : null,
    ],
  );
  return fileId;
};
