// SPDX-FileCopyrightText: 2026 Dominik Wadowski
// SPDX-License-Identifier: FSL-1.1-ALv2

import type { ModuleDatabase, ModuleTransaction } from "@offgrid/db";
import { toBreadcrumbs } from "../../domain/files/to-breadcrumbs.js";
import { toChildrenPage } from "../../domain/files/to-children-page.js";
import { findDrive } from "../../infrastructure/drives/find-drive.js";
import { listChildren } from "../../infrastructure/files/list-children.js";
import type { ChildrenQuery, DriveRecord, FilesOutcome, ListedChildren } from "../../types.js";
import { readAsUser } from "../read-as-user.js";

export const listDriveChildren = (
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
    return { outcome: "found", value: await listRootPage(tx, drive, query) };
  });

const listRootPage = async (
  tx: ModuleTransaction,
  drive: DriveRecord,
  query: ChildrenQuery,
): Promise<ListedChildren> => {
  const rows = await listChildren(tx, {
    driveId: drive.driveId,
    parentId: null,
    cursor: query.cursor,
    take: query.limit + 1,
  });
  return {
    page: toChildrenPage(rows, query.limit),
    breadcrumbs: toBreadcrumbs(drive, []),
  };
};
