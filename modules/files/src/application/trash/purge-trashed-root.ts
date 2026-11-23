// SPDX-FileCopyrightText: 2026 Dominik Wadowski
// SPDX-License-Identifier: FSL-1.1-ALv2

import type { ModuleDatabase } from "@offgrid/db";
import type { FileStorage } from "@offgrid/file-storage";
import { TRASH_PURGE_BATCH_SIZE } from "../../constants.js";
import { planPurgeBatches } from "../../domain/trash/plan-purge-batches.js";
import { findDrive } from "../../infrastructure/drives/find-drive.js";
import { findFileAnyState } from "../../infrastructure/trash/find-file-any-state.js";
import { findFullSubtree } from "../../infrastructure/trash/find-full-subtree.js";
import type { TrashedRootPlan, TrashedRootPurgeOutcome } from "../../types.js";
import { readAsUser } from "../read-as-user.js";
import { deleteStoredBytes } from "../files/delete-stored-bytes.js";
import { purgeBatch } from "./purge-batch.js";

export const purgeTrashedRoot = async (
  db: ModuleDatabase,
  storage: FileStorage,
  userId: string,
  rootId: string,
): Promise<TrashedRootPurgeOutcome> => {
  const plan = await readTrashedRootPlan(db, userId, rootId);
  if (plan === null) {
    return { outcome: "not-found" };
  }
  for (const batch of planPurgeBatches(plan.subtree, TRASH_PURGE_BATCH_SIZE)) {
    const outcome = await purgeBatch(db, userId, plan.root, batch, plan.owner);
    if (outcome.rootRestored) {
      return { outcome: "restored" };
    }
    await deleteStoredBytes(storage, outcome.storageKeys);
  }
  return { outcome: "found", value: null };
};

const readTrashedRootPlan = (
  db: ModuleDatabase,
  userId: string,
  rootId: string,
): Promise<TrashedRootPlan | null> =>
  readAsUser(db, userId, async (tx) => {
    const root = await findFileAnyState(tx, rootId);
    if (root === null || root.deletedAt === null) {
      return null;
    }
    const drive = await findDrive(tx, root.driveId);
    if (drive === null) {
      return null;
    }
    return {
      root,
      owner: { userId: drive.userId, familyId: drive.familyId },
      subtree: await findFullSubtree(tx, root),
    };
  });
