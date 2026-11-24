// SPDX-FileCopyrightText: 2026 Dominik Wadowski
// SPDX-License-Identifier: FSL-1.1-ALv2

import type { ModuleTransaction } from "@offgrid/db";
import type { FileRecord, RestoreTrashedFileInput } from "../../types.js";
import { toFileRecord } from "../files/to-file-record.js";

export const restoreTrashedFile = async (
  tx: ModuleTransaction,
  fileId: string,
  input: RestoreTrashedFileInput,
): Promise<FileRecord | null> => {
  const { count } = await tx.filesFile.updateMany({
    where: { fileId, deletedAt: { not: null } },
    data: {
      name: input.name,
      parentId: input.parentId,
      deletedAt: null,
      updatedAt: input.updatedAt,
      version: { increment: 1 },
    },
  });
  if (count === 0) {
    return null;
  }
  const row = await tx.filesFile.findUniqueOrThrow({ where: { fileId } });
  return toFileRecord(row);
};
