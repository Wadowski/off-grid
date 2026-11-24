// SPDX-FileCopyrightText: 2026 Dominik Wadowski
// SPDX-License-Identifier: FSL-1.1-ALv2

import type { SortKeyField } from "../../types.js";

export const toSortKeyValue = (field: SortKeyField, sortValue: string): string | Date | bigint => {
  if (field === "updatedAt") {
    return new Date(sortValue);
  }
  if (field === "sizeBytes") {
    return BigInt(sortValue);
  }
  return sortValue;
};
