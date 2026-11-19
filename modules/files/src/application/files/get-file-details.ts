// SPDX-FileCopyrightText: 2026 Dominik Wadowski
// SPDX-License-Identifier: FSL-1.1-ALv2

import type { ModuleDatabase, ModuleTransaction } from "@offgrid/db";
import { toBreadcrumbs } from "../../domain/files/to-breadcrumbs.js";
import { findDrive } from "../../infrastructure/drives/find-drive.js";
import { findAncestors } from "../../infrastructure/files/find-ancestors.js";
import { findLiveFile } from "../../infrastructure/files/find-file.js";
import type { FileDetails, FileRecord, FilesOutcome } from "../../types.js";
import { readAsUser } from "../read-as-user.js";

export const getFileDetails = (
  db: ModuleDatabase,
  userId: string,
  fileId: string,
): Promise<FilesOutcome<FileDetails>> =>
  readAsUser(db, userId, async (tx) => {
    const file = await findLiveFile(tx, fileId);
    if (file === null) {
      return { outcome: "not-found" };
    }
    const details = await detailsFor(tx, file);
    return details === null ? { outcome: "not-found" } : { outcome: "found", value: details };
  });

const detailsFor = async (tx: ModuleTransaction, file: FileRecord): Promise<FileDetails | null> => {
  const drive = await findDrive(tx, file.driveId);
  const ancestors = await findAncestors(tx, file);
  if (drive === null || ancestors === null) {
    return null;
  }
  return { file, breadcrumbs: toBreadcrumbs(drive, ancestors) };
};
