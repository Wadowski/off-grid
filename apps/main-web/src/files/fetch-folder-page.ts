// SPDX-FileCopyrightText: 2026 Dominik Wadowski
// SPDX-License-Identifier: FSL-1.1-ALv2

import { listDriveChildren, listFileChildren } from "./files-api.js";
import type { Drive, FileEntry, FileListPage } from "./types.js";

export const fetchFolderPage = (
  driveId: Drive["id"],
  folderId: FileEntry["id"] | null,
  cursor: string | null,
): Promise<FileListPage> => {
  const options = cursor === null ? {} : { cursor };
  return folderId === null
    ? listDriveChildren(driveId, options)
    : listFileChildren(folderId, options);
};
