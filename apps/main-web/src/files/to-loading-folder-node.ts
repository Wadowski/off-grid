// SPDX-FileCopyrightText: 2026 Dominik Wadowski
// SPDX-License-Identifier: FSL-1.1-ALv2

import type { FolderNodeState, FolderTreeNodeRef } from "./types.js";

export const toLoadingFolderNode = (
  previous: FolderNodeState | undefined,
  node: FolderTreeNodeRef,
  cursor: string | null,
): FolderNodeState => ({
  driveId: node.driveId,
  folderId: node.folderId,
  status: "loading",
  folders: cursor === null ? [] : (previous?.folders ?? []),
  nextCursor: cursor === null ? null : (previous?.nextCursor ?? null),
  isLoadingMore: cursor !== null,
  errorTextId: null,
});
