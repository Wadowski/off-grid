// SPDX-FileCopyrightText: 2026 Dominik Wadowski
// SPDX-License-Identifier: FSL-1.1-ALv2

import type { ChildrenSort, SortKeyField } from "../../types.js";

export const toSortKeyField = (sort: ChildrenSort, isFolder: boolean): SortKeyField => {
  if (sort === "modified") {
    return "updatedAt";
  }
  if (sort === "size" && !isFolder) {
    return "sizeBytes";
  }
  return "name";
};
