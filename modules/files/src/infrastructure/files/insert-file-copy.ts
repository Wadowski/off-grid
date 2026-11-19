// SPDX-FileCopyrightText: 2026 Dominik Wadowski
// SPDX-License-Identifier: FSL-1.1-ALv2

import type { ModuleTransaction } from "@offgrid/db";
import type { FileRecord, FileOwner } from "../../types.js";
import { toFileRecord } from "./to-file-record.js";

export const insertFileCopy = async (
  tx: ModuleTransaction,
  copy: FileRecord,
  owner: FileOwner,
): Promise<FileRecord> => {
  const row = await tx.filesFile.create({
    data: {
      fileId: copy.fileId,
      driveId: copy.driveId,
      parentId: copy.parentId,
      userId: owner.userId,
      familyId: owner.familyId,
      name: copy.name,
      isFolder: copy.isFolder,
      mimeType: copy.mimeType,
      sizeBytes: copy.sizeBytes,
      currentVersionId: copy.currentVersionId,
      version: 1,
      deletedAt: copy.deletedAt,
    },
  });
  return toFileRecord(row);
};
