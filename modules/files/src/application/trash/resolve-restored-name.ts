// SPDX-FileCopyrightText: 2026 Dominik Wadowski
// SPDX-License-Identifier: FSL-1.1-ALv2

import type { ModuleTransaction } from "@offgrid/db";
import { restoredName } from "../../domain/trash/restored-name.js";
import { splitFileName } from "../../domain/trash/split-file-name.js";
import { findSiblingNamesWithStem } from "../../infrastructure/trash/find-sibling-names-with-stem.js";
import type { FileRecord } from "../../types.js";

export const resolveRestoredName = async (
  tx: ModuleTransaction,
  file: FileRecord,
  parentId: string | null,
): Promise<string> => {
  const { stem } = splitFileName(file.name, file.isFolder);
  const takenNames = await findSiblingNamesWithStem(tx, {
    driveId: file.driveId,
    parentId,
    stem,
  });
  return restoredName(file.name, file.isFolder, takenNames);
};
