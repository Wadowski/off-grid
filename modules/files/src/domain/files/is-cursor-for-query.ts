// SPDX-FileCopyrightText: 2026 Dominik Wadowski
// SPDX-License-Identifier: FSL-1.1-ALv2

import type { ChildrenCursor, ChildrenDirection, ChildrenSort } from "../../types.js";

export const isCursorForQuery = (
  cursor: ChildrenCursor,
  query: { readonly sort: ChildrenSort; readonly direction: ChildrenDirection },
): boolean => cursor.sort === query.sort && cursor.direction === query.direction;
