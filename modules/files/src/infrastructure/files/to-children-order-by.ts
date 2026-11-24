// SPDX-FileCopyrightText: 2026 Dominik Wadowski
// SPDX-License-Identifier: FSL-1.1-ALv2

import type { ChildrenDirection, SortKeyField } from "../../types.js";

export const toChildrenOrderBy = (field: SortKeyField, direction: ChildrenDirection) => {
  if (field === "updatedAt") {
    return [{ updatedAt: direction }, { fileId: "asc" as const }];
  }
  if (field === "sizeBytes") {
    return [{ sizeBytes: direction }, { fileId: "asc" as const }];
  }
  return [{ name: direction }, { fileId: "asc" as const }];
};
