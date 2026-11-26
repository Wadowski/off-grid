// SPDX-FileCopyrightText: 2026 Dominik Wadowski
// SPDX-License-Identifier: FSL-1.1-ALv2

import type {
  Drive,
  FileEntry,
  FileListItem,
  FilesView,
  FolderContentsState,
} from "../../../../files/types.js";

export type PendingTrash = {
  readonly entry: FileListItem;
  readonly returnFocusTo: HTMLElement | null;
};

export type PendingEntryAction = {
  readonly entry: FileListItem;
  readonly returnFocusTo: HTMLElement | null;
};

export type PendingRename = {
  readonly entry: FileListItem;
  readonly returnFocusTo: HTMLElement | null;
};

export type FolderContentsProps = {
  readonly drives: readonly Drive[];
  readonly driveId: Drive["id"];
  readonly folderId: FileEntry["id"] | null;
  readonly contents: FolderContentsState;
  readonly phone: boolean;
  readonly view: FilesView;
  readonly selectedId: FileListItem["id"] | null;
  readonly onSelect: (id: FileListItem["id"]) => void;
  readonly onEntryLeft: (fileId: FileListItem["id"]) => void;
  readonly onEntryTrashed: (fileId: FileListItem["id"]) => void;
  readonly onEntryRenamed: (entry: FileEntry) => void;
};
