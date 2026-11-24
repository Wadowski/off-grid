// SPDX-FileCopyrightText: 2026 Dominik Wadowski
// SPDX-License-Identifier: FSL-1.1-ALv2

import type { ModuleDatabase } from "@offgrid/db";
import type { FileStorage } from "@offgrid/file-storage";
import type { Logger } from "@offgrid/observability";
import { DAY_MS } from "../../constants.js";
import { purgeExpiredTrash } from "../../application/trash/purge-expired-trash.js";

export const runTrashPurge = async (
  db: ModuleDatabase,
  storage: FileStorage,
  now: Date,
  retentionDays: number,
  logger: Logger,
): Promise<void> => {
  try {
    const counts = await purgeExpiredTrash(
      db,
      storage,
      new Date(now.getTime() - retentionDays * DAY_MS),
      logger,
    );
    logger.info("files trash purge finished", { ...counts });
    if (counts.failedRootCount > 0 || counts.skippedRootCount > 0) {
      logger.warn("files trash purge skipped or failed some roots", { ...counts });
    }
  } catch (error) {
    logger.error("files trash purge failed", {
      error: error instanceof Error ? error.name : "unknown",
    });
  }
};
