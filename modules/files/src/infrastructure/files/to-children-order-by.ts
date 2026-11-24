// SPDX-FileCopyrightText: 2026 Dominik Wadowski
// SPDX-License-Identifier: FSL-1.1-ALv2

import type { ChildrenDirection, SortKeyField } from "../../types.js";

const SORT_COLUMN = {
  name: "name",
  updatedAt: "updatedAt",
  sizeBytes: "sizeBytes",
} as const satisfies Record<SortKeyField, string>;

export const toChildrenOrderBy = (field: SortKeyField, direction: ChildrenDirection) => [
  { [SORT_COLUMN[field]]: direction },
  { fileId: "asc" as const },
];
