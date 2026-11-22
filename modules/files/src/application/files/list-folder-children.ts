// SPDX-FileCopyrightText: 2026 Dominik Wadowski
// SPDX-License-Identifier: FSL-1.1-ALv2

import type { ModuleDatabase, ModuleTransaction } from "@offgrid/db";
import { toBreadcrumbs } from "../../domain/files/to-breadcrumbs.js";
import { toChildrenPage } from "../../domain/files/to-children-page.js";
import { findDrive } from "../../infrastructure/drives/find-drive.js";
import { findAncestors } from "../../infrastructure/files/find-ancestors.js";
import { findLiveFile } from "../../infrastructure/files/find-file.js";
import { listChildren } from "../../infrastructure/files/list-children.js";
import type { ChildrenQuery, FileRecord, FilesOutcome, ListedChildren } from "../../types.js";
import { readAsUser } from "../read-as-user.js";
import { readItemCounts } from "./read-item-counts.js";

export const listFolderChildren = (
  db: ModuleDatabase,
  userId: string,
  folderId: string,
  query: ChildrenQuery,
): Promise<FilesOutcome<ListedChildren>> =>
  readAsUser(db, userId, async (tx) => {
    const folder = await findLiveFile(tx, folderId);
    if (folder === null || !folder.isFolder) {
      return { outcome: "not-found" };
    }
    const folderPage = await listFolderPage(tx, folder, query);
    return folderPage === null ? { outcome: "not-found" } : { outcome: "found", value: folderPage };
  });

const listFolderPage = async (
  tx: ModuleTransaction,
  folder: FileRecord,
  query: ChildrenQuery,
): Promise<ListedChildren | null> => {
  const drive = await findDrive(tx, folder.driveId);
  const ancestors = await findAncestors(tx, folder);
  if (drive === null || ancestors === null) {
    return null;
  }
  const rows = await listChildren(tx, {
    driveId: folder.driveId,
    parentId: folder.fileId,
    cursor: query.cursor,
    take: query.limit + 1,
  });
  const page = toChildrenPage(rows, query.limit);
  return {
    page,
    itemCounts: await readItemCounts(tx, folder.driveId, page.records),
    breadcrumbs: toBreadcrumbs(drive, [...ancestors, folder]),
  };
};
