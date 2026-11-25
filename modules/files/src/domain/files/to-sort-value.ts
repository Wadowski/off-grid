// SPDX-FileCopyrightText: 2026 Dominik Wadowski
// SPDX-License-Identifier: FSL-1.1-ALv2

import type { ChildrenSort, FileRecord } from "../../types.js";
import { toSortKeyField } from "./to-sort-key-field.js";

export const toSortValue = (record: FileRecord, sort: ChildrenSort): string => {
  const field = toSortKeyField(sort, record.isFolder);
  if (field === "updatedAt") {
    return record.updatedAt.toISOString();
  }
  if (field === "sizeBytes") {
    return (record.sizeBytes ?? 0n).toString();
  }
  return record.name;
};
