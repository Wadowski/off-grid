// SPDX-FileCopyrightText: 2026 Dominik Wadowski
// SPDX-License-Identifier: FSL-1.1-ALv2

import type { ModuleTransaction } from "@offgrid/db";
import { MAX_ANCESTOR_DEPTH } from "../../constants.js";
import type { TrashChainLink } from "../../types.js";

export const findTrashedChainTopDown = async (
  tx: ModuleTransaction,
  fileId: string,
): Promise<string[]> => {
  const chain: string[] = [];
  let currentId: string | null = fileId;
  for (let depth = 0; currentId !== null; depth += 1) {
    if (depth >= MAX_ANCESTOR_DEPTH) {
      throw new Error("The trash chain is deeper than the allowed depth");
    }
    const row: TrashChainLink | null = await tx.filesFile.findFirst({
      where: { fileId: currentId },
      select: { parentId: true, deletedAt: true },
    });
    if (row === null) {
      break;
    }
    if (row.deletedAt !== null) {
      chain.unshift(currentId);
    }
    currentId = row.parentId;
  }
  return chain;
};
