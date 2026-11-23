// SPDX-FileCopyrightText: 2026 Dominik Wadowski
// SPDX-License-Identifier: FSL-1.1-ALv2

import type { ModuleDatabase } from "@offgrid/db";
import type { FileStorage } from "@offgrid/file-storage";
import { findDrive } from "../../infrastructure/drives/find-drive.js";
import { findTrashedFileIds } from "../../infrastructure/trash/find-trashed-file-ids.js";
import type { FilesOutcome } from "../../types.js";
import { readAsUser } from "../read-as-user.js";
import { purgeTrashedRoot } from "./purge-trashed-root.js";

export const emptyDriveTrash = async (
  db: ModuleDatabase,
  storage: FileStorage,
  userId: string,
  driveId: string,
): Promise<FilesOutcome<null>> => {
  const trashedIds = await readAsUser(db, userId, async (tx) =>
    (await findDrive(tx, driveId)) === null ? null : findTrashedFileIds(tx, driveId),
  );
  if (trashedIds === null) {
    return { outcome: "not-found" };
  }
  for (const fileId of trashedIds) {
    await purgeTrashedRoot(db, storage, userId, fileId);
  }
  return { outcome: "found", value: null };
};
