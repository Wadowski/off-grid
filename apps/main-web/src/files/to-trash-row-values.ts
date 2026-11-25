// SPDX-FileCopyrightText: 2026 Dominik Wadowski
// SPDX-License-Identifier: FSL-1.1-ALv2

import { toFileRowValues } from "./to-file-row-values.js";
import type { FileListItem, FileRowValues } from "./types.js";

export const toTrashRowValues = (item: FileListItem): FileRowValues => ({
  ...toFileRowValues(item),
  modifiedAt: new Date(item.deletedAt ?? item.updatedAt),
});
