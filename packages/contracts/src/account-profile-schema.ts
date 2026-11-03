// SPDX-FileCopyrightText: 2026 Dominik Wadowski
// SPDX-License-Identifier: FSL-1.1-ALv2

import { z } from "zod";
import { displayNameSchema } from "./display-name-schema.js";
import { familySummarySchema } from "./family-summary-schema.js";
import { userIdSchema } from "./user-id-schema.js";

export const accountProfileSchema = z.object({
  id: userIdSchema,
  email: z.string(),
  displayName: displayNameSchema,
  instanceRole: z.enum(["admin", "user"]),
  families: z.array(familySummarySchema),
});
