// SPDX-FileCopyrightText: 2026 Dominik Wadowski
// SPDX-License-Identifier: FSL-1.1-ALv2

import { decodeCursor } from "../../domain/files/decode-cursor.js";
import type { TrashQuery } from "../../types.js";

export const toTrashQuery = (query: {
  readonly cursor?: string | undefined;
  readonly limit: number;
}): TrashQuery => ({
  cursor: query.cursor === undefined ? null : decodeCursor(query.cursor),
  limit: query.limit,
});
