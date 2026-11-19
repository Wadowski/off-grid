// SPDX-FileCopyrightText: 2026 Dominik Wadowski
// SPDX-License-Identifier: FSL-1.1-ALv2

import type { ModuleDatabase } from "@offgrid/db";
import { InvalidMoveError } from "../errors/invalid-move-error.js";
import { publishFileUpdated } from "../../events/files/publish-file-updated.js";
import { isSelfOrDescendantTarget } from "../../domain/files/is-self-or-descendant-target.js";
import { findDrive } from "../../infrastructure/drives/find-drive.js";
import { findAncestors } from "../../infrastructure/files/find-ancestors.js";
import { findLiveFile } from "../../infrastructure/files/find-file.js";
import { updateFile } from "../../infrastructure/files/update-file.js";
import type { FilesOutcome, MoveFileInput, MoveOutcome } from "../../types.js";
import { writeAsUser } from "../write-as-user.js";
import { assertNameFree } from "./assert-name-free.js";
import { findTargetPath } from "./find-target-path.js";

export const moveFile = (
  db: ModuleDatabase,
  userId: string,
  fileId: string,
  input: MoveFileInput,
): Promise<FilesOutcome<MoveOutcome>> =>
  writeAsUser(db, userId, async (tx) => {
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
    if (targetDrive.driveId !== file.driveId) {
      throw new InvalidMoveError();
    }
    if (file.parentId === input.parentId) {
      return { outcome: "found", value: { file, crossOwnerNotice: false } };
    }
    await assertNameFree(tx, {
      driveId: file.driveId,
      parentId: input.parentId,
      name: file.name,
      excludeFileId: fileId,
    });
    const moved = await updateFile(tx, fileId, { parentId: input.parentId, updatedAt: new Date() });
    await publishFileUpdated(tx, {
      file: moved,
      owner: { userId: sourceDrive.userId, familyId: sourceDrive.familyId },
    });
    return { outcome: "found", value: { file: moved, crossOwnerNotice: false } };
  });
