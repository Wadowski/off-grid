// SPDX-FileCopyrightText: 2026 Dominik Wadowski
// SPDX-License-Identifier: FSL-1.1-ALv2

import type { FileListItem } from "../../../../files/types.js";

export type TrashPhoneListProps = {
  readonly items: readonly FileListItem[];
  readonly busy: boolean;
  readonly onRestore: (item: FileListItem) => void;
  readonly onPurge: (item: FileListItem) => void;
};
