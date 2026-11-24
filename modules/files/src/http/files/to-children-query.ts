// SPDX-FileCopyrightText: 2026 Dominik Wadowski
// SPDX-License-Identifier: FSL-1.1-ALv2

import type { ChildrenQuery } from "../../types.js";
import { decodeCursor } from "../../domain/files/decode-cursor.js";

export const toChildrenQuery = (query: {
  readonly cursor?: string | undefined;
  readonly limit: number;
  readonly sort: ChildrenQuery["sort"];
  readonly direction: ChildrenQuery["direction"];
}): ChildrenQuery => ({
  cursor: query.cursor === undefined ? null : decodeCursor(query.cursor),
  limit: query.limit,
  sort: query.sort,
  direction: query.direction,
});
