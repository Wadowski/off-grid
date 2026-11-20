// SPDX-FileCopyrightText: 2026 Dominik Wadowski
// SPDX-License-Identifier: FSL-1.1-ALv2

import { randomUUID } from "node:crypto";
import type { ModuleTransaction } from "@offgrid/db";
import type { StoredObject } from "@offgrid/file-storage";
import { planCopyTree } from "../../domain/files/plan-copy-tree.js";
import { publishFileCreated } from "../../events/files/publish-file-created.js";
import { insertFileCopy } from "../../infrastructure/files/insert-file-copy.js";
import { insertFileVersion } from "../../infrastructure/files/insert-file-version.js";
import type { CrossOwnerPlan, FileRecord } from "../../types.js";
import { InvalidMoveError } from "../errors/invalid-move-error.js";
import { assertNameFree } from "./assert-name-free.js";
import { assertSourceUnchanged } from "./assert-source-unchanged.js";
import { removeSourceTree } from "./remove-source-tree.js";

export const copyFileTree = async (
  tx: ModuleTransaction,
  userId: string,
  plan: CrossOwnerPlan,
  copies: ReadonlyMap<string, StoredObject>,
): Promise<FileRecord> => {
  await assertSourceUnchanged(tx, plan);
  await assertNameFree(tx, {
    driveId: plan.target.driveId,
    parentId: plan.parentId,
    name: plan.file.name,
    excludeFileId: plan.file.fileId,
  });
  const owner = { userId: plan.target.userId, familyId: plan.target.familyId };
  const sourceById = new Map(plan.tree.entries.map((entry) => [entry.fileId, entry]));
  const versionById = new Map(plan.tree.versions.map((version) => [version.versionId, version]));
  const now = new Date();
  const copiedRecords: FileRecord[] = [];
  for (const step of planCopyTree(plan.tree.entries, plan.parentId, randomUUID)) {
    const source = sourceById.get(step.sourceFileId);
    if (source === undefined) {
      throw new InvalidMoveError();
    }
    const versionId = source.isFolder || source.currentVersionId === null ? null : randomUUID();
    const copy = await insertFileCopy(
      tx,
      {
        fileId: step.copyFileId,
        driveId: plan.target.driveId,
        parentId: step.copyParentId,
        name: source.name,
        isFolder: source.isFolder,
        mimeType: source.mimeType,
        sizeBytes: source.sizeBytes,
        currentVersionId: versionId,
        version: 1,
        createdAt: now,
        updatedAt: now,
        deletedAt: source.deletedAt,
      },
      owner,
    );
    if (versionId !== null && source.currentVersionId !== null) {
      const sourceVersion = versionById.get(source.currentVersionId);
      const stored = copies.get(source.currentVersionId);
      if (sourceVersion === undefined || stored === undefined) {
        throw new InvalidMoveError();
      }
      await insertFileVersion(tx, {
        versionId,
        fileId: copy.fileId,
        owner,
        number: 1,
        storageKey: stored.key,
        sizeBytes: sourceVersion.sizeBytes,
        mimeType: sourceVersion.mimeType,
        sha256: stored.sha256,
        createdByUserId: userId,
      });
    }
    await publishFileCreated(tx, { file: copy, owner });
    copiedRecords.push(copy);
  }
  await removeSourceTree(tx, plan);
  const root = copiedRecords[0];
  if (root === undefined) {
    throw new InvalidMoveError();
  }
  return root;
};
