// SPDX-FileCopyrightText: 2026 Dominik Wadowski
// SPDX-License-Identifier: FSL-1.1-ALv2

import type { ModuleDatabase } from "@offgrid/db";
import type { FileStorage, StoredObject } from "@offgrid/file-storage";
import { writeAsUser } from "../write-as-user.js";
import type { CrossOwnerPlan, FileRecord } from "../../types.js";
import { copyFileBytes } from "./copy-file-bytes.js";
import { copyFileTree } from "./copy-file-tree.js";
import { deleteStoredBytes } from "./delete-stored-bytes.js";

export const moveAcrossOwners = async (
  db: ModuleDatabase,
  storage: FileStorage,
  userId: string,
  plan: CrossOwnerPlan,
): Promise<FileRecord> => {
  const copies = new Map<string, StoredObject>();
  try {
    for (const version of plan.tree.versions) {
      if (isCurrentVersion(plan, version.versionId)) {
        copies.set(version.versionId, await copyFileBytes(storage, version));
      }
    }
    const moved = await writeAsUser(db, userId, (tx) => copyFileTree(tx, userId, plan, copies));
    await deleteStoredBytes(
      storage,
      plan.tree.versions.map((version) => version.storageKey),
    );
    return moved;
  } catch (error) {
    await deleteStoredBytes(
      storage,
      [...copies.values()].map((stored) => stored.key),
    );
    throw error;
  }
};

const isCurrentVersion = (plan: CrossOwnerPlan, versionId: string): boolean =>
  plan.tree.entries.some((entry) => entry.currentVersionId === versionId);
