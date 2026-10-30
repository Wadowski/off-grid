// SPDX-FileCopyrightText: 2026 Dominik Wadowski
// SPDX-License-Identifier: FSL-1.1-ALv2

import { z } from "zod";
import { familySummarySchema } from "./family-summary-schema.js";

export const familyListSchema = z.object({
  families: z.array(familySummarySchema),
});
