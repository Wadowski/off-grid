// SPDX-FileCopyrightText: 2026 Dominik Wadowski
// SPDX-License-Identifier: FSL-1.1-ALv2

import type { ModuleDatabase } from "@offgrid/db";
import { publishFileRemoved } from "../../events/files/publish-file-removed.js";
import { deleteFileRows } from "../../infrastructure/files/delete-file-rows.js";
import { deleteFileVersions } from "../../infrastructure/files/delete-file-versions.js";
import { findFullSubtree } from "../../infrastructure/trash/find-full-subtree.js";
import { findStorageKeysOfFiles } from "../../infrastructure/trash/find-storage-keys-of-files.js";
import { lockTrashedFiles } from "../../infrastructure/trash/lock-trashed-files.js";
import { lockTrashedRoot } from "../../infrastructure/trash/lock-trashed-root.js";
import type { FileOwner, FileRecord, PurgeBatchOutcome } from "../../types.js";
import { writeAsUser } from "../write-as-user.js";

export const purgeBatch = (
  db: ModuleDatabase,
  userId: string,
  root: FileRecord,
  batch: readonly FileRecord[],
  owner: FileOwner,
): Promise<PurgeBatchOutcome> =>
  writeAsUser(db, userId, async (tx): Promise<PurgeBatchOutcome> => {
    if (!(await lockTrashedRoot(tx, root.fileId))) {
      return { rootRestored: true, storageKeys: [] };
    }
    const stillTrashed = await lockTrashedFiles(
      tx,
      batch.map((entry) => entry.fileId),
    );
    const currentById = new Map(
      (await findFullSubtree(tx, root)).map((entry) => [entry.fileId, entry]),
    );
    const deletable = batch.flatMap((entry) => {
      const current = currentById.get(entry.fileId);
      if (current === undefined) {
        return [];
      }
      return current.deletedAt === null || stillTrashed.has(entry.fileId) ? [current] : [];
    });
    if (deletable.length === 0) {
      return { rootRestored: false, storageKeys: [] };
    }
    const fileIds = deletable.map((entry) => entry.fileId);
    const storageKeys = await findStorageKeysOfFiles(tx, fileIds);
    await deleteFileVersions(tx, fileIds);
    await deleteFileRows(tx, fileIds);
    for (const entry of deletable) {
      await publishFileRemoved(tx, { file: entry, owner });
    }
    return { rootRestored: false, storageKeys };
  });
