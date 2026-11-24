// SPDX-FileCopyrightText: 2026 Dominik Wadowski
// SPDX-License-Identifier: FSL-1.1-ALv2

import { fileListDirectionSchema, fileListSortSchema } from "@offgrid/contracts";
import { z } from "zod";
import { isValidSortValue } from "./is-valid-sort-value.js";
import { toSortKeyField } from "./to-sort-key-field.js";

export const cursorPayloadSchema = z
  .object({
    isFolder: z.boolean(),
    fileId: z.uuid(),
    sort: fileListSortSchema.default("name"),
    direction: fileListDirectionSchema.default("asc"),
    sortValue: z.string().max(255).optional(),
    name: z.string().min(1).max(255).optional(),
  })
  .transform(({ name, sortValue, ...position }) => ({
    ...position,
    sortValue: sortValue ?? name ?? "",
  }))
  .refine(
    (cursor) => isValidSortValue(toSortKeyField(cursor.sort, cursor.isFolder), cursor.sortValue),
    "The cursor sort value is not valid",
  );
