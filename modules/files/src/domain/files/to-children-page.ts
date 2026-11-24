// SPDX-FileCopyrightText: 2026 Dominik Wadowski
// SPDX-License-Identifier: FSL-1.1-ALv2

import type { ChildrenCursor, ChildrenPage, ChildrenPageOptions, FileRecord } from "../../types.js";
import { toChildrenCursor } from "./to-children-cursor.js";

export const toChildrenPage = (
  rowsWithOneExtra: readonly FileRecord[],
  options: ChildrenPageOptions,
): ChildrenPage => {
  const records = rowsWithOneExtra.slice(0, options.limit);
  const hasMore = rowsWithOneExtra.length > options.limit;
  const last = records.at(-1);
  const nextCursor: ChildrenCursor | null =
    hasMore && last !== undefined ? toChildrenCursor(last, options.sort, options.direction) : null;
  return { records, nextCursor };
};
