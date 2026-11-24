// SPDX-FileCopyrightText: 2026 Dominik Wadowski
// SPDX-License-Identifier: FSL-1.1-ALv2

import type { SortKeyField } from "../../types.js";

export const isValidSortValue = (field: SortKeyField, sortValue: string): boolean => {
  if (field === "updatedAt") {
    return !Number.isNaN(Date.parse(sortValue));
  }
  if (field === "sizeBytes") {
    return /^\d+$/.test(sortValue);
  }
  return sortValue.length > 0;
};
