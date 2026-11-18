// SPDX-FileCopyrightText: 2026 Dominik Wadowski
// SPDX-License-Identifier: FSL-1.1-ALv2

import type { ModuleDatabase } from "@offgrid/db";
import type { Logger } from "@offgrid/observability";
import { checkStorageIntegrity } from "../../application/storage/check-storage-integrity.js";
import type { FileStorage } from "@offgrid/file-storage";

export const runStorageIntegritySweep = async (
  db: ModuleDatabase,
  storage: FileStorage,
  now: Date,
  logger: Logger,
): Promise<void> => {
  try {
    const report = await checkStorageIntegrity(db, storage, now);
    const counts = {
      orphanCount: report.orphanCount,
      missingCount: report.missingCount,
      checkedRowCount: report.checkedRowCount,
      checkedObjectCount: report.checkedObjectCount,
    };
    logger.info("files storage integrity sweep finished", counts);
    if (report.orphanCount > 0 || report.missingCount > 0) {
      logger.warn("files storage integrity sweep found differences", counts);
    }
  } catch (error) {
    logger.error("files storage integrity sweep failed", {
      error: error instanceof Error ? error.name : "unknown",
    });
  }
};
