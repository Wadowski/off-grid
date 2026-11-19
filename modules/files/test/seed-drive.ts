// SPDX-FileCopyrightText: 2026 Dominik Wadowski
// SPDX-License-Identifier: FSL-1.1-ALv2

import { randomUUID } from "node:crypto";
import type { Client } from "pg";
import type { SeedOwner } from "./types.js";

export const seedDrive = async (
  admin: Client,
  input: { readonly owner: SeedOwner; readonly name: string },
): Promise<string> => {
  const driveId = randomUUID();
  const kind = input.owner.userId === null ? "family" : "personal";
  await admin.query(
    "INSERT INTO files.drive (drive_id, user_id, family_id, kind, name) VALUES ($1, $2, $3, $4, $5)",
    [driveId, input.owner.userId, input.owner.familyId, kind, input.name],
  );
  return driveId;
};
