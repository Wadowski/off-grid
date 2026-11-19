// SPDX-FileCopyrightText: 2026 Dominik Wadowski
// SPDX-License-Identifier: FSL-1.1-ALv2

import type { ModuleTransaction } from "@offgrid/db";
import type { FileRecord, SiblingNameQuery } from "../../types.js";
import { toFileRecord } from "./to-file-record.js";

export const findSiblingByName = async (
  tx: ModuleTransaction,
  query: SiblingNameQuery,
): Promise<FileRecord | null> => {
  const row = await tx.filesFile.findFirst({
    where: {
      driveId: query.driveId,
      parentId: query.parentId,
      deletedAt: null,
      fileId: { not: query.excludeFileId },
      name: { equals: query.name, mode: "insensitive" },
    },
  });
  return row === null ? null : toFileRecord(row);
};
