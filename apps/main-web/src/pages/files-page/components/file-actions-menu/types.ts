// SPDX-FileCopyrightText: 2026 Dominik Wadowski
// SPDX-License-Identifier: FSL-1.1-ALv2

import type { FileListItem } from "../../../../files/types.js";

export type EntryActionRequest = (entry: FileListItem, returnFocusTo: HTMLElement | null) => void;

export type FileActionsMenuProps = {
  readonly entry: FileListItem;
  readonly onOpen: () => void;
  readonly onRename: EntryActionRequest;
  readonly onDelete: EntryActionRequest;
};

export type FileActionHandlers = {
  readonly onOpen: () => void;
  readonly onRename: () => void;
  readonly onDelete: () => void;
};

export type TrashConfirmationProps = {
  readonly entry: FileListItem;
  readonly onCancel: () => void;
  readonly onTrashed: (entry: FileListItem) => void;
};
