// SPDX-FileCopyrightText: 2026 Dominik Wadowski
// SPDX-License-Identifier: FSL-1.1-ALv2

import type { ModuleDatabase } from "@offgrid/db";
import { publishFileUpdated } from "../../events/files/publish-file-updated.js";
import { findLiveFile } from "../../infrastructure/files/find-file.js";
import { updateFile } from "../../infrastructure/files/update-file.js";
import type { FileRecord, FilesOutcome } from "../../types.js";
import { writeAsUser } from "../write-as-user.js";
import { assertNameFree } from "./assert-name-free.js";
import { ownerOfVisibleFile } from "./owner-of-visible-file.js";

export const renameFile = (
  db: ModuleDatabase,
  userId: string,
  fileId: string,
  name: string,
): Promise<FilesOutcome<FileRecord>> =>
  writeAsUser(db, userId, async (tx) => {
    const file = await findLiveFile(tx, fileId);
    if (file === null) {
      return { outcome: "not-found" };
    }
    const owner = await ownerOfVisibleFile(tx, file);
    if (owner === null) {
      return { outcome: "not-found" };
    }
    if (file.name === name) {
      return { outcome: "found", value: file };
    }
    await assertNameFree(tx, {
      driveId: file.driveId,
      parentId: file.parentId,
      name,
      excludeFileId: fileId,
    });
    const renamed = await updateFile(tx, fileId, { name, updatedAt: new Date() });
    await publishFileUpdated(tx, { file: renamed, owner });
    return { outcome: "found", value: renamed };
  });
