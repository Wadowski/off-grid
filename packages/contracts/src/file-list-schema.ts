// SPDX-FileCopyrightText: 2026 Dominik Wadowski
// SPDX-License-Identifier: FSL-1.1-ALv2

import { z } from "zod";
import { breadcrumbSchema } from "./breadcrumb-schema.js";
import { fileListItemSchema } from "./file-list-item-schema.js";

export const fileListSchema = z.object({
  items: z.array(fileListItemSchema),
  breadcrumbs: z.array(breadcrumbSchema),
  nextCursor: z.string().min(1).max(512).nullable(),
});
