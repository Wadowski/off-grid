// SPDX-FileCopyrightText: 2026 Dominik Wadowski
// SPDX-License-Identifier: FSL-1.1-ALv2

import type { FileEntry, FileListItem } from "../../../../files/types.js";

export type RenameEntryDialogProps = {
  readonly entry: FileListItem;
  readonly onRenamed: (entry: FileEntry) => void;
  readonly onClose: () => void;
};
