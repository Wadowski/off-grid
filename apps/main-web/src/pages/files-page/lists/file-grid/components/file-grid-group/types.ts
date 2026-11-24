// SPDX-FileCopyrightText: 2026 Dominik Wadowski
// SPDX-License-Identifier: FSL-1.1-ALv2

import type { FileListItem } from "../../../../../../files/types.js";

export type FileGridGroupProps = {
  readonly label: string;
  readonly testId: string;
  readonly items: readonly FileListItem[];
  readonly selectedId: string | null;
  readonly onActivate: (item: FileListItem) => void;
};
