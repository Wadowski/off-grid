// SPDX-FileCopyrightText: 2026 Dominik Wadowski
// SPDX-License-Identifier: FSL-1.1-ALv2

import type { BreadcrumbRecord, DriveRecord, FileRecord } from "../../types.js";

export const toBreadcrumbs = (
  drive: DriveRecord,
  folderPath: readonly FileRecord[],
): BreadcrumbRecord[] => [
  { kind: "drive", id: drive.driveId, name: drive.name },
  ...folderPath.map((folder): BreadcrumbRecord => ({
    kind: "folder",
    id: folder.fileId,
    name: folder.name,
  })),
];
