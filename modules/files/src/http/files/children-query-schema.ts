// SPDX-FileCopyrightText: 2026 Dominik Wadowski
// SPDX-License-Identifier: FSL-1.1-ALv2

import { fileListQuerySchema } from "@offgrid/contracts";
import { decodeCursor } from "../../domain/files/decode-cursor.js";

export const childrenQuerySchema = fileListQuerySchema.extend({
  cursor: fileListQuerySchema.shape.cursor.refine(
    (cursor) => cursor === undefined || decodeCursor(cursor) !== null,
    "The cursor is not valid",
  ),
});
