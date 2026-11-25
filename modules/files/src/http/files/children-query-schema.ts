// SPDX-FileCopyrightText: 2026 Dominik Wadowski
// SPDX-License-Identifier: FSL-1.1-ALv2

import { fileListQuerySchema } from "@offgrid/contracts";
import { decodeCursor } from "../../domain/files/decode-cursor.js";
import { isCursorForQuery } from "../../domain/files/is-cursor-for-query.js";

export const childrenQuerySchema = fileListQuerySchema
  .extend({
    cursor: fileListQuerySchema.shape.cursor.refine(
      (cursor) => cursor === undefined || decodeCursor(cursor) !== null,
      "The cursor is not valid",
    ),
  })
  .refine(
    (query) => {
      const cursor = query.cursor === undefined ? null : decodeCursor(query.cursor);
      return cursor === null || isCursorForQuery(cursor, query);
    },
    { message: "The cursor belongs to another sort order", path: ["cursor"] },
  );
