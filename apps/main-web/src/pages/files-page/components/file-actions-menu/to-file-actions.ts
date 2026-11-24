// SPDX-FileCopyrightText: 2026 Dominik Wadowski
// SPDX-License-Identifier: FSL-1.1-ALv2

import type { MenuItem } from "@offgrid/ui";
import type { FileListItem } from "../../../../files/types.js";
import { DELETE_ICON, FILE_OPEN_ICON, FOLDER_OPEN_ICON } from "./constants.js";
import type { FileActionHandlers } from "./types.js";

export const toFileActions = (
  entry: FileListItem,
  handlers: FileActionHandlers,
): readonly MenuItem[] => [
  {
    id: "open",
    textId: "files.entryActions.open",
    icon: entry.isFolder ? FOLDER_OPEN_ICON : FILE_OPEN_ICON,
    tone: "default",
    testId: "file-action-open",
    onSelect: handlers.onOpen,
  },
  {
    id: "delete",
    textId: "files.entryActions.delete",
    icon: DELETE_ICON,
    tone: "danger",
    testId: "file-action-delete",
    onSelect: handlers.onDelete,
  },
];
