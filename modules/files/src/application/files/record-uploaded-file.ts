// SPDX-FileCopyrightText: 2026 Dominik Wadowski
// SPDX-License-Identifier: FSL-1.1-ALv2

import { randomUUID } from "node:crypto";
import type { ModuleDatabase } from "@offgrid/db";
import { publishFileCreated } from "../../events/files/publish-file-created.js";
import { findDrive } from "../../infrastructure/drives/find-drive.js";
import { insertFile } from "../../infrastructure/files/insert-file.js";
import { insertFileVersion } from "../../infrastructure/files/insert-file-version.js";
import type { FileRecord, FilesOutcome, RecordUploadInput } from "../../types.js";
import { writeAsUser } from "../write-as-user.js";
import { assertNameFree } from "./assert-name-free.js";
import { findTargetPath } from "./find-target-path.js";

export const recordUploadedFile = (
  db: ModuleDatabase,
  userId: string,
  upload: RecordUploadInput,
): Promise<FilesOutcome<FileRecord>> =>
  writeAsUser(db, userId, async (tx) => {
    const drive = await findDrive(tx, upload.driveId);
    if (drive === null) {
      return { outcome: "not-found" };
    }
    const targetPath = await findTargetPath(tx, upload.driveId, upload.parentId);
    if (targetPath === null) {
      return { outcome: "not-found" };
    }
    const fileId = randomUUID();
    const versionId = randomUUID();
    await assertNameFree(tx, {
      driveId: upload.driveId,
      parentId: upload.parentId,
      name: upload.name,
      excludeFileId: fileId,
    });
    const owner = { userId: drive.userId, familyId: drive.familyId };
    const file = await insertFile(tx, {
      fileId,
      driveId: upload.driveId,
      parentId: upload.parentId,
      name: upload.name,
      mimeType: upload.mimeType,
      sizeBytes: BigInt(upload.stored.sizeBytes),
      currentVersionId: versionId,
      owner,
    });
    await insertFileVersion(tx, {
      versionId,
      fileId,
      owner,
      number: 1,
      storageKey: upload.stored.key,
      sizeBytes: BigInt(upload.stored.sizeBytes),
      mimeType: upload.mimeType,
      sha256: upload.stored.sha256,
      createdByUserId: userId,
    });
    await publishFileCreated(tx, { file, owner });
    return { outcome: "found", value: file };
  });
