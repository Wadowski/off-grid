// SPDX-FileCopyrightText: 2026 Dominik Wadowski
// SPDX-License-Identifier: FSL-1.1-ALv2

import type { ModuleTransaction } from "@offgrid/db";
import { findFileVersions } from "../../infrastructure/files/find-file-versions.js";
import { findSubtree } from "../../infrastructure/files/find-subtree.js";
import type { FileRecord, SourceTree } from "../../types.js";

export const collectSourceTree = async (
  tx: ModuleTransaction,
  root: FileRecord,
): Promise<SourceTree | null> => {
  const entries = await findSubtree(tx, root);
  if (entries === null) {
    return null;
  }
  const versions = await findFileVersions(
    tx,
    entries.map((entry) => entry.fileId),
  );
  return { entries, versions };
};
