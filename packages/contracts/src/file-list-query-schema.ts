// SPDX-FileCopyrightText: 2026 Dominik Wadowski
// SPDX-License-Identifier: FSL-1.1-ALv2

import { z } from "zod";

export const fileListSortSchema = z.enum(["name", "modified", "size"]);

export const fileListDirectionSchema = z.enum(["asc", "desc"]);

export const fileListQuerySchema = z.object({
  cursor: z.string().min(1).max(512).optional(),
  limit: z.coerce.number().int().min(1).max(200).default(50),
  sort: fileListSortSchema.default("name"),
  direction: fileListDirectionSchema.default("asc"),
});
