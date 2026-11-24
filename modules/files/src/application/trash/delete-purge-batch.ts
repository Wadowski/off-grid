// SPDX-FileCopyrightText: 2026 Dominik Wadowski
// SPDX-License-Identifier: FSL-1.1-ALv2

import type { ModuleTransaction } from "@offgrid/db";
import { publishFileRemoved } from "../../events/files/publish-file-removed.js";
import { deleteFileRows } from "../../infrastructure/files/delete-file-rows.js";
import { deleteFileVersions } from "../../infrastructure/files/delete-file-versions.js";
import { findStorageKeysOfFiles } from "../../infrastructure/trash/find-storage-keys-of-files.js";
import type { FileOwner, FileRecord } from "../../types.js";

export const deletePurgeBatch = async (
  tx: ModuleTransaction,
  batch: readonly FileRecord[],
  owner: FileOwner,
): Promise<string[]> => {
  const fileIds = batch.map((entry) => entry.fileId);
  const storageKeys = await findStorageKeysOfFiles(tx, fileIds);
  await deleteFileVersions(tx, fileIds);
  await deleteFileRows(tx, fileIds);
  for (const entry of batch) {
    await publishFileRemoved(tx, { file: entry, owner });
  }
  return storageKeys;
};
