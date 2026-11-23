// SPDX-FileCopyrightText: 2026 Dominik Wadowski
// SPDX-License-Identifier: FSL-1.1-ALv2

import type { ModuleDatabase } from "@offgrid/db";
import { publishFileUpdated } from "../../events/files/publish-file-updated.js";
import { findDrive } from "../../infrastructure/drives/find-drive.js";
import { restoreTrashedFile } from "../../infrastructure/trash/restore-trashed-file.js";
import { findFileAnyState } from "../../infrastructure/trash/find-file-any-state.js";
import type { FileRecord, FilesOutcome } from "../../types.js";
import { writeAsUser } from "../write-as-user.js";
import { ownerOfVisibleFile } from "../files/owner-of-visible-file.js";
import { NotTrashedError } from "../errors/not-trashed-error.js";
import { findRestorableParentId } from "./find-restorable-parent-id.js";
import { resolveRestoredName } from "./resolve-restored-name.js";
import { assertTrashed } from "./assert-trashed.js";

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
    if (file.deletedAt === null && (await ownerOfVisibleFile(tx, file)) === null) {
      return { outcome: "not-found" };
    }
    assertTrashed(file);
    const drive = await findDrive(tx, file.driveId);
    if (drive === null) {
      return { outcome: "not-found" };
    }
    const parentId = await findRestorableParentId(tx, file);
    const name = await resolveRestoredName(tx, file, parentId);
    const restored = await restoreTrashedFile(tx, fileId, {
      name,
      parentId,
      updatedAt: new Date(),
    });
    if (restored === null) {
      if ((await findFileAnyState(tx, fileId)) === null) {
        return { outcome: "not-found" };
      }
      throw new NotTrashedError();
    }
    await publishFileUpdated(tx, {
      file: restored,
      owner: { userId: drive.userId, familyId: drive.familyId },
    });
    return { outcome: "found", value: restored };
  });
