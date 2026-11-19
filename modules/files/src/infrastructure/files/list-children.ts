// SPDX-FileCopyrightText: 2026 Dominik Wadowski
// SPDX-License-Identifier: FSL-1.1-ALv2

import type { ModuleTransaction } from "@offgrid/db";
import type { ChildrenCursor, FileRecord } from "../../types.js";
import { toFileRecord } from "./to-file-record.js";
import { afterCursorCondition } from "./after-cursor-condition.js";

export const listChildren = async (
  tx: ModuleTransaction,
  input: {
    readonly driveId: string;
    readonly parentId: string | null;
    readonly cursor: ChildrenCursor | null;
    readonly take: number;
  },
): Promise<FileRecord[]> => {
  const rows = await tx.filesFile.findMany({
    where: {
      driveId: input.driveId,
      parentId: input.parentId,
      deletedAt: null,
      ...(input.cursor === null ? {} : { AND: [afterCursorCondition(input.cursor)] }),
    },
    orderBy: [{ isFolder: "desc" }, { name: "asc" }, { fileId: "asc" }],
    take: input.take,
  });
  return rows.map(toFileRecord);
};
