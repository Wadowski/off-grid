// SPDX-FileCopyrightText: 2026 Dominik Wadowski
// SPDX-License-Identifier: FSL-1.1-ALv2

import { z } from "zod";
import { breadcrumbSchema } from "./breadcrumb-schema.js";
import { fileSchema } from "./file-schema.js";

export const fileDetailsSchema = z.object({
  file: fileSchema,
  breadcrumbs: z.array(breadcrumbSchema),
});
