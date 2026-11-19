// SPDX-FileCopyrightText: 2026 Dominik Wadowski
// SPDX-License-Identifier: FSL-1.1-ALv2

import type { ModuleTransaction } from "@offgrid/db";
import { MAX_ANCESTOR_DEPTH } from "../../constants.js";
import type { FileRecord } from "../../types.js";
import { findLiveFile } from "./find-file.js";

export const findAncestors = async (
  tx: ModuleTransaction,
  file: FileRecord,
): Promise<FileRecord[] | null> => {
  const ancestors: FileRecord[] = [];
  let parentId = file.parentId;
  while (parentId !== null) {
    if (ancestors.length >= MAX_ANCESTOR_DEPTH) {
      return null;
    }
    const parent = await findLiveFile(tx, parentId);
    if (parent === null) {
      return null;
    }
    ancestors.unshift(parent);
    parentId = parent.parentId;
  }
  return ancestors;
};
