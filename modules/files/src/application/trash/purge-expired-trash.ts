// SPDX-FileCopyrightText: 2026 Dominik Wadowski
// SPDX-License-Identifier: FSL-1.1-ALv2

import type { ModuleDatabase } from "@offgrid/db";
import { withFilesTrashPurgeContext } from "@offgrid/db";
import type { FileStorage } from "@offgrid/file-storage";
import { TRASH_PURGE_PAGE_SIZE } from "../../constants.js";
import { findExpiredTrashedRoots } from "../../infrastructure/trash/find-expired-trashed-roots.js";
import type {
  ExpiredRoot,
  ExpiredRootCursor,
  MutableTrashPurgeCounts,
  TrashPurgeCounts,
} from "../../types.js";
import { purgeTrashedRoot } from "./purge-trashed-root.js";
import { resolveActingUser } from "./resolve-acting-user.js";

export const purgeExpiredTrash = async (
  db: ModuleDatabase,
  storage: FileStorage,
  cutoff: Date,
): Promise<TrashPurgeCounts> => {
  const counts: MutableTrashPurgeCounts = {
    purgedRootCount: 0,
    failedRootCount: 0,
    skippedRootCount: 0,
  };
  let after: ExpiredRootCursor | null = null;
  for (;;) {
    const roots: ExpiredRoot[] = await readExpiredPage(db, cutoff, after);
    if (roots.length === 0) {
      return counts;
    }
    for (const root of roots) {
      await purgeOne(db, storage, root, counts);
    }
    const last = roots.at(-1);
    if (last === undefined) {
      return counts;
    }
    after = { deletedAt: last.deletedAt ?? cutoff, fileId: last.fileId };
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
  counts: MutableTrashPurgeCounts,
): Promise<void> => {
  const actingUserId = await resolveActingUser(db, root);
  if (actingUserId === null) {
    counts.skippedRootCount += 1;
    return;
  }
  try {
    const outcome = await purgeTrashedRoot(db, storage, actingUserId, root.fileId);
    if (outcome.outcome === "found") {
      counts.purgedRootCount += 1;
    }
  } catch {
    counts.failedRootCount += 1;
  }
};
