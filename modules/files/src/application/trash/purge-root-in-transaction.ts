// SPDX-FileCopyrightText: 2026 Dominik Wadowski
// SPDX-License-Identifier: FSL-1.1-ALv2

import type { ModuleTransaction } from "@offgrid/db";
import { TRASH_PURGE_BATCH_SIZE } from "../../constants.js";
import { planPurgeBatches } from "../../domain/trash/plan-purge-batches.js";
import { findDrive } from "../../infrastructure/drives/find-drive.js";
import { findFileAnyState } from "../../infrastructure/trash/find-file-any-state.js";
import { findFullSubtree } from "../../infrastructure/trash/find-full-subtree.js";
import { lockTrashedChain } from "../../infrastructure/trash/lock-trashed-chain.js";
import type { TrashedRootPurgeWrite } from "../../types.js";
import { deletePurgeBatch } from "./delete-purge-batch.js";

export const purgeRootInTransaction = async (
  tx: ModuleTransaction,
  rootId: string,
): Promise<TrashedRootPurgeWrite> => {
  const seen = await findFileAnyState(tx, rootId);
  if (seen === null || seen.deletedAt === null) {
    return { outcome: "not-found" };
  }
  await lockTrashedChain(tx, rootId);
  const root = await findFileAnyState(tx, rootId);
  if (root === null) {
    return { outcome: "not-found" };
  }
  if (root.deletedAt === null) {
    return { outcome: "restored" };
  }
  const drive = await findDrive(tx, root.driveId);
  if (drive === null) {
    return { outcome: "not-found" };
  }
  const owner = { userId: drive.userId, familyId: drive.familyId };
  const subtree = await findFullSubtree(tx, root);
  const storageKeys: string[] = [];
  for (const batch of planPurgeBatches(subtree, TRASH_PURGE_BATCH_SIZE)) {
    storageKeys.push(...(await deletePurgeBatch(tx, batch, owner)));
  }
  return { outcome: "purged", storageKeys };
};
