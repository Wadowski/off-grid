// SPDX-FileCopyrightText: 2026 Dominik Wadowski
// SPDX-License-Identifier: FSL-1.1-ALv2

import type { ChildrenCursor, ChildrenDirection, ChildrenSort, FileRecord } from "../../types.js";
import { toSortValue } from "./to-sort-value.js";

export const toChildrenCursor = (
  record: FileRecord,
  sort: ChildrenSort,
  direction: ChildrenDirection,
): ChildrenCursor => ({
  isFolder: record.isFolder,
  fileId: record.fileId,
  sort,
  direction,
  sortValue: toSortValue(record, sort),
});
