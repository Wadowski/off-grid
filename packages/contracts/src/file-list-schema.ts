// SPDX-FileCopyrightText: 2026 Dominik Wadowski
// SPDX-License-Identifier: FSL-1.1-ALv2

import { z } from "zod";
import { breadcrumbSchema } from "./breadcrumb-schema.js";
import { fileSchema } from "./file-schema.js";

export const fileListSchema = z.object({
  items: z.array(fileSchema),
  breadcrumbs: z.array(breadcrumbSchema),
  nextCursor: z.string().min(1).max(512).nullable(),
});
