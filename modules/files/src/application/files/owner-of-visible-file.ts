// SPDX-FileCopyrightText: 2026 Dominik Wadowski
// SPDX-License-Identifier: FSL-1.1-ALv2

import type { ModuleTransaction } from "@offgrid/db";
import { findDrive } from "../../infrastructure/drives/find-drive.js";
import { findAncestors } from "../../infrastructure/files/find-ancestors.js";
import type { FileRecord } from "../../types.js";

export const ownerOfVisibleFile = async (tx: ModuleTransaction, file: FileRecord) => {
  const drive = await findDrive(tx, file.driveId);
  const ancestors = await findAncestors(tx, file);
  if (drive === null || ancestors === null) {
    return null;
  }
  return { userId: drive.userId, familyId: drive.familyId };
};
