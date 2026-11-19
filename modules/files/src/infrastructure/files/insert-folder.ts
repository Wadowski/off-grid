// SPDX-FileCopyrightText: 2026 Dominik Wadowski
// SPDX-License-Identifier: FSL-1.1-ALv2

import type { ModuleTransaction } from "@offgrid/db";
import type { FileRecord, NewFolderInput } from "../../types.js";
import { toFileRecord } from "./to-file-record.js";

export const insertFolder = async (
  tx: ModuleTransaction,
  input: NewFolderInput,
): Promise<FileRecord> => {
  const row = await tx.filesFile.create({
    data: {
      fileId: input.fileId,
      driveId: input.driveId,
      parentId: input.parentId,
      userId: input.owner.userId,
      familyId: input.owner.familyId,
      name: input.name,
      isFolder: true,
      version: 1,
    },
  });
  return toFileRecord(row);
};
