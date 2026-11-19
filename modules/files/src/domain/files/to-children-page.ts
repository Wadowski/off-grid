// SPDX-FileCopyrightText: 2026 Dominik Wadowski
// SPDX-License-Identifier: FSL-1.1-ALv2

import type { ChildrenPage, FileRecord } from "../../types.js";

export const toChildrenPage = (
  rowsWithOneExtra: readonly FileRecord[],
  limit: number,
): ChildrenPage => {
  const records = rowsWithOneExtra.slice(0, limit);
  const hasMore = rowsWithOneExtra.length > limit;
  const last = records.at(-1);
  return {
    records,
    nextCursor:
      hasMore && last !== undefined
        ? { isFolder: last.isFolder, name: last.name, fileId: last.fileId }
        : null,
  };
};
