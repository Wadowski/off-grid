// SPDX-FileCopyrightText: 2026 Dominik Wadowski
// SPDX-License-Identifier: FSL-1.1-ALv2

import type { ModuleDatabase, ModuleTransaction } from "@offgrid/db";
import { toBreadcrumbs } from "../../domain/files/to-breadcrumbs.js";
import { toChildrenPage } from "../../domain/files/to-children-page.js";
import { findDrive } from "../../infrastructure/drives/find-drive.js";
import { listTrashed } from "../../infrastructure/trash/list-trashed.js";
import type { ChildrenQuery, DriveRecord, FilesOutcome, ListedChildren } from "../../types.js";
import { readAsUser } from "../read-as-user.js";
import { readItemCounts } from "../files/read-item-counts.js";

export const listDriveTrash = (
  db: ModuleDatabase,
  userId: string,
  driveId: string,
  query: ChildrenQuery,
): Promise<FilesOutcome<ListedChildren>> =>
  readAsUser(db, userId, async (tx) => {
    const drive = await findDrive(tx, driveId);
    if (drive === null) {
      return { outcome: "not-found" };
    }
    return { outcome: "found", value: await readTrashPage(tx, drive, query) };
  });

const readTrashPage = async (
  tx: ModuleTransaction,
  drive: DriveRecord,
  query: ChildrenQuery,
): Promise<ListedChildren> => {
  const rows = await listTrashed(tx, {
    driveId: drive.driveId,
    cursor: query.cursor,
    take: query.limit + 1,
  });
  const page = toChildrenPage(rows, query.limit);
  return {
    page,
    itemCounts: await readItemCounts(tx, drive.driveId, page.records),
    breadcrumbs: toBreadcrumbs(drive, []),
  };
};
