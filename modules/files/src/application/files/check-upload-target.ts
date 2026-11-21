// SPDX-FileCopyrightText: 2026 Dominik Wadowski
// SPDX-License-Identifier: FSL-1.1-ALv2

import { randomUUID } from "node:crypto";
import type { ModuleDatabase } from "@offgrid/db";
import { findDrive } from "../../infrastructure/drives/find-drive.js";
import type { UploadTarget } from "../../types.js";
import { readAsUser } from "../read-as-user.js";
import { assertNameFree } from "./assert-name-free.js";
import { findTargetPath } from "./find-target-path.js";

export const checkUploadTarget = (
  db: ModuleDatabase,
  userId: string,
  target: UploadTarget,
): Promise<boolean> =>
  readAsUser(db, userId, async (tx) => {
    const drive = await findDrive(tx, target.driveId);
    if (drive === null) {
      return false;
    }
    const targetPath = await findTargetPath(tx, target.driveId, target.parentId);
    if (targetPath === null) {
      return false;
    }
    await assertNameFree(tx, {
      driveId: target.driveId,
      parentId: target.parentId,
      name: target.name,
      excludeFileId: randomUUID(),
    });
    return true;
  });
