// SPDX-FileCopyrightText: 2026 Dominik Wadowski
// SPDX-License-Identifier: FSL-1.1-ALv2

import type { Drive, FileListItem, FolderNodeState, FolderPickerNode, MoveSource } from "./types.js";

export const toFolderPickerChildren = (
  folders: readonly FileListItem[],
  driveId: Drive["id"],
  nodes: Readonly<Record<string, FolderNodeState>>,
  source: MoveSource,
  parentDisabled: boolean,
): FolderPickerNode[] =>
  folders.map((folder) => {
    const state = nodes[folder.id];
    const disabled = parentDisabled || folder.id === source.entryId;
    return {
      id: folder.id,
      driveId,
      folderId: folder.id,
      label: folder.name,
      isDrive: false,
      hasChildren: true,
      disabled,
      isCurrent: driveId === source.driveId && folder.id === source.parentId,
      caption: driveId === source.driveId && folder.id === source.parentId ? "currentLocation" : null,
      children:
        state === undefined
          ? undefined
          : toFolderPickerChildren(state.folders, driveId, nodes, source, disabled),
    };
  });
