// SPDX-FileCopyrightText: 2026 Dominik Wadowski
// SPDX-License-Identifier: FSL-1.1-ALv2

import type { ModuleTransaction } from "@offgrid/db";
import type { ChildrenCursor, FileRecord } from "../../types.js";
import { afterCursorCondition } from "../files/after-cursor-condition.js";
import { toFileRecord } from "../files/to-file-record.js";
import { toNameKeysetCursor } from "./to-name-keyset-cursor.js";

export const listTrashed = async (
  tx: ModuleTransaction,
  input: {
    readonly driveId: string;
    readonly cursor: ChildrenCursor | null;
    readonly take: number;
  },
): Promise<FileRecord[]> => {
  const rows = await tx.filesFile.findMany({
    where: {
      driveId: input.driveId,
      deletedAt: { not: null },
      ...(input.cursor === null
        ? {}
        : { AND: [afterCursorCondition(toNameKeysetCursor(input.cursor))] }),
    },
    orderBy: [{ isFolder: "desc" }, { name: "asc" }, { fileId: "asc" }],
    take: input.take,
  });
  return rows.map(toFileRecord);
};
