// SPDX-FileCopyrightText: 2026 Dominik Wadowski
// SPDX-License-Identifier: FSL-1.1-ALv2

import type { ModuleDatabase } from "@offgrid/db";
import { withFilesTrashPurgeContext } from "@offgrid/db";
import type { FileStorage } from "@offgrid/file-storage";
import type { Logger } from "@offgrid/observability";
import { TRASH_PURGE_PAGE_SIZE } from "../../constants.js";
import { findExpiredTrashedRoots } from "../../infrastructure/trash/find-expired-trashed-roots.js";
import type { ExpiredRoot, ExpiredRootCursor, TrashPurgeCounts } from "../../types.js";
import { purgeTrashedRoot } from "./purge-trashed-root.js";
import { resolveActingUser } from "./resolve-acting-user.js";

export const purgeExpiredTrash = async (
  db: ModuleDatabase,
  storage: FileStorage,
  cutoff: Date,
  logger: Logger,
): Promise<TrashPurgeCounts> => {
  const counts = {
    purgedRootCount: 0,
    failedRootCount: 0,
    skippedRootCount: 0,
  };
  let after: ExpiredRootCursor | null = null;
  for (;;) {
    const roots: ExpiredRoot[] = await readExpiredPage(db, cutoff, after);
    const last = roots.at(-1);
    if (last === undefined) {
      return counts;
    }
    for (const root of roots) {
      counts[await purgeOne(db, storage, root, logger)] += 1;
    }
    after = { deletedAt: last.deletedAt, fileId: last.fileId };
  }
};

const readExpiredPage = (
  db: ModuleDatabase,
  cutoff: Date,
  after: ExpiredRootCursor | null,
): Promise<ExpiredRoot[]> =>
  db.$transaction(async (tx) => {
    await withFilesTrashPurgeContext(tx);
    return findExpiredTrashedRoots(tx, { cutoff, after, take: TRASH_PURGE_PAGE_SIZE });
  });

const purgeOne = async (
  db: ModuleDatabase,
  storage: FileStorage,
  root: ExpiredRoot,
  logger: Logger,
): Promise<keyof TrashPurgeCounts> => {
  const actingUserId = await resolveActingUser(db, root);
  if (actingUserId === null) {
    return "skippedRootCount";
  }
  try {
    const outcome = await purgeTrashedRoot(db, storage, actingUserId, root.fileId);
    return outcome.outcome === "found" ? "purgedRootCount" : "skippedRootCount";
  } catch (error) {
    logger.warn("files trash purge failed for one root", {
      error: error instanceof Error ? error.name : "unknown",
    });
    return "failedRootCount";
  }
};
