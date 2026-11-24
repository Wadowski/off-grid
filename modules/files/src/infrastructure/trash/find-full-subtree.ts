// SPDX-FileCopyrightText: 2026 Dominik Wadowski
// SPDX-License-Identifier: FSL-1.1-ALv2

import type { ModuleTransaction } from "@offgrid/db";
import { MAX_ANCESTOR_DEPTH } from "../../constants.js";
import type { FileRecord } from "../../types.js";
import { toFileRecord } from "../files/to-file-record.js";

export const findFullSubtree = async (
  tx: ModuleTransaction,
  root: FileRecord,
): Promise<FileRecord[]> => {
  const entries: FileRecord[] = [root];
  let frontier = root.isFolder ? [root.fileId] : [];
  for (let depth = 0; frontier.length > 0; depth += 1) {
    if (depth >= MAX_ANCESTOR_DEPTH) {
      throw new Error("The trash subtree is deeper than the allowed depth");
    }
    const rows = await tx.filesFile.findMany({
      where: { driveId: root.driveId, parentId: { in: frontier } },
      orderBy: { fileId: "asc" },
    });
    const children = rows.map(toFileRecord);
    entries.push(...children);
    frontier = children.filter((child) => child.isFolder).map((child) => child.fileId);
  }
  return entries;
};
