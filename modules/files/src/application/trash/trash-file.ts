// SPDX-FileCopyrightText: 2026 Dominik Wadowski
// SPDX-License-Identifier: FSL-1.1-ALv2

import type { ModuleDatabase } from "@offgrid/db";
import { publishFileUpdated } from "../../events/files/publish-file-updated.js";
import { findLiveFile } from "../../infrastructure/files/find-file.js";
import { updateFile } from "../../infrastructure/files/update-file.js";
import type { FileRecord, FilesOutcome } from "../../types.js";
import { writeAsUser } from "../write-as-user.js";
import { ownerOfVisibleFile } from "../files/owner-of-visible-file.js";

export const trashFile = (
  db: ModuleDatabase,
  userId: string,
  fileId: string,
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
    const now = new Date();
    const trashed = await updateFile(tx, fileId, { deletedAt: now, updatedAt: now });
    await publishFileUpdated(tx, { file: trashed, owner });
    return { outcome: "found", value: trashed };
  });
