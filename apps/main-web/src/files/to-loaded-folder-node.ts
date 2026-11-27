// SPDX-FileCopyrightText: 2026 Dominik Wadowski
// SPDX-License-Identifier: FSL-1.1-ALv2

import { splitFoldersAndFiles } from "./split-folders-and-files.js";
import type { FileListPage, FolderNodeState, FolderTreeNodeRef } from "./types.js";

export const toLoadedFolderNode = (
  previous: FolderNodeState | undefined,
  node: FolderTreeNodeRef,
  page: FileListPage,
  isFirstPage: boolean,
): FolderNodeState => ({
  driveId: node.driveId,
  folderId: node.folderId,
  status: "ready",
  folders: [
    ...(isFirstPage ? [] : (previous?.folders ?? [])),
    ...splitFoldersAndFiles(page.items).folders,
  ],
  nextCursor: page.nextCursor,
  isLoadingMore: false,
  errorTextId: null,
});
