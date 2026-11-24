// SPDX-FileCopyrightText: 2026 Dominik Wadowski
// SPDX-License-Identifier: FSL-1.1-ALv2

import type { ChildrenCursor, SortKeyField } from "../../types.js";
import { toSortKeyValue } from "./to-sort-key-value.js";

export const afterSortCursorCondition = (field: SortKeyField, cursor: ChildrenCursor) => {
  const comparison = cursor.direction === "asc" ? "gt" : "lt";
  const value = toSortKeyValue(field, cursor.sortValue);
  return {
    OR: [{ [field]: { [comparison]: value } }, { [field]: value, fileId: { gt: cursor.fileId } }],
  };
};
