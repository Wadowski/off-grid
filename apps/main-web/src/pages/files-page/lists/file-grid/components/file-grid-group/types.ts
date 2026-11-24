// SPDX-FileCopyrightText: 2026 Dominik Wadowski
// SPDX-License-Identifier: FSL-1.1-ALv2

import type { ParseKeys } from "i18next";
import type { FileListItem } from "../../../../../../files/types.js";

export type FileGridGroupProps = {
  readonly labelTextId: ParseKeys;
  readonly testId: string;
  readonly items: readonly FileListItem[];
  readonly selectedId: string | null;
  readonly onActivate: (item: FileListItem) => void;
};
