// SPDX-FileCopyrightText: 2026 Dominik Wadowski
// SPDX-License-Identifier: FSL-1.1-ALv2

import type { ModuleTransaction } from "@offgrid/db";
import { isSelfOrDescendantTarget } from "../../domain/files/is-self-or-descendant-target.js";
import { findDrive } from "../../infrastructure/drives/find-drive.js";
import { findAncestors } from "../../infrastructure/files/find-ancestors.js";
import { findLiveFile } from "../../infrastructure/files/find-file.js";
import { InvalidMoveError } from "../errors/invalid-move-error.js";
import type { FilesOutcome, MoveFileInput, MovePlan } from "../../types.js";
import { assertNameFree } from "./assert-name-free.js";
import { collectSourceTree } from "./collect-source-tree.js";
import { findTargetPath } from "./find-target-path.js";

export const readMovePlan = async (
  tx: ModuleTransaction,
  fileId: string,
  input: MoveFileInput,
): Promise<FilesOutcome<MovePlan>> => {
  const file = await findLiveFile(tx, fileId);
  if (file === null) {
    return { outcome: "not-found" };
  }
  const sourceDrive = await findDrive(tx, file.driveId);
  const sourceAncestors = await findAncestors(tx, file);
  const targetDrive = await findDrive(tx, input.driveId);
  if (sourceDrive === null || sourceAncestors === null || targetDrive === null) {
    return { outcome: "not-found" };
  }
  const targetPath = await findTargetPath(tx, targetDrive.driveId, input.parentId);
  if (targetPath === null) {
    return { outcome: "not-found" };
  }
  if (
    isSelfOrDescendantTarget(
      fileId,
      targetPath.map((entry) => entry.fileId),
    )
  ) {
    throw new InvalidMoveError();
  }
  const sourceOwner = { userId: sourceDrive.userId, familyId: sourceDrive.familyId };
  if (targetDrive.driveId === file.driveId) {
    return file.parentId === input.parentId
      ? { outcome: "found", value: { kind: "no-op", file } }
      : {
          outcome: "found",
          value: { kind: "same-drive", file, owner: sourceOwner, parentId: input.parentId },
        };
  }
  const tree = await collectSourceTree(tx, file);
  if (tree === null) {
    throw new InvalidMoveError();
  }
  await assertNameFree(tx, {
    driveId: targetDrive.driveId,
    parentId: input.parentId,
    name: file.name,
    excludeFileId: fileId,
  });
  return {
    outcome: "found",
    value: {
      kind: "cross-owner",
      file,
      sourceOwner,
      target: targetDrive,
      parentId: input.parentId,
      tree,
    },
  };
};
