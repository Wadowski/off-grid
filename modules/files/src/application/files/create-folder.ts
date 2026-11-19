// SPDX-FileCopyrightText: 2026 Dominik Wadowski
// SPDX-License-Identifier: FSL-1.1-ALv2

import { randomUUID } from "node:crypto";
import type { ModuleDatabase } from "@offgrid/db";
import { publishFileCreated } from "../../events/files/publish-file-created.js";
import { findDrive } from "../../infrastructure/drives/find-drive.js";
import { insertFolder } from "../../infrastructure/files/insert-folder.js";
import type { CreateFolderInput, FileRecord, FilesOutcome } from "../../types.js";
import { writeAsUser } from "../write-as-user.js";
import { assertNameFree } from "./assert-name-free.js";
import { findTargetPath } from "./find-target-path.js";

export const createFolder = (
  db: ModuleDatabase,
  userId: string,
  driveId: string,
  input: CreateFolderInput,
): Promise<FilesOutcome<FileRecord>> =>
  writeAsUser(db, userId, async (tx) => {
    const drive = await findDrive(tx, driveId);
    if (drive === null) {
      return { outcome: "not-found" };
    }
    const targetPath = await findTargetPath(tx, driveId, input.parentId);
    if (targetPath === null) {
      return { outcome: "not-found" };
    }
    const fileId = randomUUID();
    await assertNameFree(tx, {
      driveId,
      parentId: input.parentId,
      name: input.name,
      excludeFileId: fileId,
    });
    const owner = { userId: drive.userId, familyId: drive.familyId };
    const folder = await insertFolder(tx, {
      fileId,
      driveId,
      parentId: input.parentId,
      name: input.name,
      owner,
    });
    await publishFileCreated(tx, { file: folder, owner });
    return { outcome: "found", value: folder };
  });
