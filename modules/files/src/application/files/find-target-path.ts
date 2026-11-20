// SPDX-FileCopyrightText: 2026 Dominik Wadowski
// SPDX-License-Identifier: FSL-1.1-ALv2

import type { ModuleTransaction } from "@offgrid/db";
import { findAncestors } from "../../infrastructure/files/find-ancestors.js";
import { findLiveFile } from "../../infrastructure/files/find-file.js";
import type { FileRecord } from "../../types.js";

export const findTargetPath = async (
  tx: ModuleTransaction,
  driveId: string,
  parentId: string | null,
): Promise<FileRecord[] | null> => {
  if (parentId === null) {
    return [];
  }
  const target = await findLiveFile(tx, parentId);
  if (target === null || !target.isFolder || target.driveId !== driveId) {
    return null;
  }
  const ancestors = await findAncestors(tx, target);
  return ancestors === null ? null : [...ancestors, target];
};
