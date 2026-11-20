// SPDX-FileCopyrightText: 2026 Dominik Wadowski
// SPDX-License-Identifier: FSL-1.1-ALv2

import type { ModuleTransaction } from "@offgrid/db";
import type { FileRecord, FileUpdateInput } from "../../types.js";
import { toFileRecord } from "./to-file-record.js";

export const updateFile = async (
  tx: ModuleTransaction,
  fileId: string,
  input: FileUpdateInput,
): Promise<FileRecord> => {
  const row = await tx.filesFile.update({
    where: { fileId },
    data: {
      name: input.name,
      parentId: input.parentId,
      updatedAt: input.updatedAt,
      version: { increment: 1 },
    },
  });
  return toFileRecord(row);
};
