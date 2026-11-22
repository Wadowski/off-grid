// SPDX-FileCopyrightText: 2026 Dominik Wadowski
// SPDX-License-Identifier: FSL-1.1-ALv2

import { z } from "zod";
import { folderSchema, regularFileSchema } from "./file-schema.js";

const folderListItemSchema = folderSchema.extend({
  itemCount: z.number().int().min(0),
});

export const fileListItemSchema = z.discriminatedUnion("isFolder", [
  folderListItemSchema,
  regularFileSchema,
]);
