// SPDX-FileCopyrightText: 2026 Dominik Wadowski
// SPDX-License-Identifier: FSL-1.1-ALv2

import { toFolderPickerChildren } from "./to-folder-picker-children.js";
import { toCrossOwnerCaption } from "./to-cross-owner-caption.js";
import type { Drive, FolderNodeState, FolderPickerNode, MoveSource } from "./types.js";

export const toFolderPickerNodes = (
  drives: readonly Drive[],
  nodes: Readonly<Record<string, FolderNodeState>>,
  source: MoveSource,
): FolderPickerNode[] =>
  drives.map((drive) => {
    const state = nodes[drive.id];
    const isCurrent = drive.id === source.driveId && source.parentId === null;
    return {
      id: drive.id,
      driveId: drive.id,
      folderId: null,
      label: drive.name,
      isDrive: true,
      hasChildren: true,
      disabled: false,
      isCurrent,
      caption: isCurrent
        ? "currentLocation"
        : toCrossOwnerCaption(drives, source.driveId, drive.id),
      children:
        state === undefined
          ? undefined
          : toFolderPickerChildren(state.folders, drive.id, nodes, source, false),
    };
  });
