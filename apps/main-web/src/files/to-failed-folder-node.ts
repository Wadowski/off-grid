// SPDX-FileCopyrightText: 2026 Dominik Wadowski
// SPDX-License-Identifier: FSL-1.1-ALv2

import type { FilesErrorTextId, FolderNodeState, FolderTreeNodeRef } from "./types.js";

export const toFailedFolderNode = (
  previous: FolderNodeState | undefined,
  node: FolderTreeNodeRef,
  errorTextId: FilesErrorTextId,
): FolderNodeState => ({
  driveId: node.driveId,
  folderId: node.folderId,
  status: "failed",
  folders: previous?.folders ?? [],
  nextCursor: previous?.nextCursor ?? null,
  isLoadingMore: false,
  errorTextId,
});
