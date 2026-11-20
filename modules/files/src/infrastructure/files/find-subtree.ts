// SPDX-FileCopyrightText: 2026 Dominik Wadowski
// SPDX-License-Identifier: FSL-1.1-ALv2

import type { ModuleTransaction } from "@offgrid/db";
import { MAX_ANCESTOR_DEPTH, MAX_MOVE_ENTRY_COUNT } from "../../constants.js";
import type { FileRecord } from "../../types.js";
import { toFileRecord } from "./to-file-record.js";

export const findSubtree = async (
  tx: ModuleTransaction,
  root: FileRecord,
): Promise<FileRecord[] | null> => {
  const entries: FileRecord[] = [root];
  let frontier = root.isFolder ? [root.fileId] : [];
  for (let depth = 0; frontier.length > 0; depth += 1) {
    if (depth >= MAX_ANCESTOR_DEPTH) {
      return null;
    }
    const rows = await tx.filesFile.findMany({
      where: { driveId: root.driveId, parentId: { in: frontier } },
      orderBy: { fileId: "asc" },
    });
    if (entries.length + rows.length > MAX_MOVE_ENTRY_COUNT) {
      return null;
    }
    const children = rows.map(toFileRecord);
    entries.push(...children);
    frontier = children.filter((child) => child.isFolder).map((child) => child.fileId);
  }
  return entries;
};
