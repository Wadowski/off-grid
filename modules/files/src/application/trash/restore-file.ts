// SPDX-FileCopyrightText: 2026 Dominik Wadowski
// SPDX-License-Identifier: FSL-1.1-ALv2

import type { ModuleDatabase } from "@offgrid/db";
import { publishFileUpdated } from "../../events/files/publish-file-updated.js";
import { findDrive } from "../../infrastructure/drives/find-drive.js";
import { updateFile } from "../../infrastructure/files/update-file.js";
import { findFileAnyState } from "../../infrastructure/trash/find-file-any-state.js";
import type { FileRecord, FilesOutcome } from "../../types.js";
import { writeAsUser } from "../write-as-user.js";
import { ownerOfVisibleFile } from "../files/owner-of-visible-file.js";
import { NotTrashedError } from "../errors/not-trashed-error.js";
import { resolveRestoreTarget } from "./resolve-restore-target.js";
import { resolveRestoredName } from "./resolve-restored-name.js";

export const restoreFile = (
  db: ModuleDatabase,
  userId: string,
  fileId: string,
): Promise<FilesOutcome<FileRecord>> =>
  writeAsUser(db, userId, async (tx) => {
    const file = await findFileAnyState(tx, fileId);
    if (file === null) {
      return { outcome: "not-found" };
    }
    if (file.deletedAt === null) {
      return (await ownerOfVisibleFile(tx, file)) === null
        ? { outcome: "not-found" }
        : rejectLiveFile();
    }
    const drive = await findDrive(tx, file.driveId);
    if (drive === null) {
      return { outcome: "not-found" };
    }
    const parentId = await resolveRestoreTarget(tx, file);
    const name = await resolveRestoredName(tx, file, parentId);
    const restored = await updateFile(tx, fileId, {
      name,
      parentId,
      deletedAt: null,
      updatedAt: new Date(),
    });
    await publishFileUpdated(tx, {
      file: restored,
      owner: { userId: drive.userId, familyId: drive.familyId },
    });
    return { outcome: "found", value: restored };
  });

const rejectLiveFile = (): never => {
  throw new NotTrashedError();
};
