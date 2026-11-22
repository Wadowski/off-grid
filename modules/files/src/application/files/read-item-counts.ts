// SPDX-FileCopyrightText: 2026 Dominik Wadowski
// SPDX-License-Identifier: FSL-1.1-ALv2

import type { ModuleTransaction } from "@offgrid/db";
import { countFolderChildren } from "../../infrastructure/files/count-folder-children.js";
import type { FileRecord } from "../../types.js";

export const readItemCounts = (
  tx: ModuleTransaction,
  driveId: string,
  records: readonly FileRecord[],
): Promise<ReadonlyMap<string, number>> =>
  countFolderChildren(tx, {
    driveId,
    folderIds: records.filter((record) => record.isFolder).map((record) => record.fileId),
  });
