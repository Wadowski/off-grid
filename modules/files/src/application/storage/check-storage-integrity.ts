// SPDX-FileCopyrightText: 2026 Dominik Wadowski
// SPDX-License-Identifier: FSL-1.1-ALv2

import type { ModuleDatabase } from "@offgrid/db";
import { STORAGE_SWEEP_BATCH_SIZE } from "../../constants.js";
import type { FileStorage } from "@offgrid/file-storage";
import type { StorageIntegrityReport } from "../../types.js";
import { findMissingKeys } from "./find-missing-keys.js";
import { findOrphanKeys } from "./find-orphan-keys.js";

export const checkStorageIntegrity = async (
  db: ModuleDatabase,
  storage: FileStorage,
  now: Date,
  batchSize: number = STORAGE_SWEEP_BATCH_SIZE,
): Promise<StorageIntegrityReport> => {
  const orphans = await findOrphanKeys(db, storage, now, batchSize);
  const missing = await findMissingKeys(db, storage, batchSize);
  return {
    orphanKeys: orphans.orphanKeys,
    missingKeys: missing.missingKeys,
    orphanCount: orphans.orphanKeys.length,
    missingCount: missing.missingKeys.length,
    checkedRowCount: missing.checkedRowCount,
    checkedObjectCount: orphans.checkedObjectCount,
  };
};
