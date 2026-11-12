// SPDX-FileCopyrightText: 2026 Dominik Wadowski
// SPDX-License-Identifier: FSL-1.1-ALv2

import { z } from "zod";
import { calendarColorSchema } from "./calendar-color-schema.js";
import { calendarIdSchema } from "./calendar-id-schema.js";
import { familyIdSchema } from "./family-id-schema.js";
import { nameSchema } from "./name-schema.js";

export const calendarSchema = z.object({
  id: calendarIdSchema,
  name: nameSchema,
  color: calendarColorSchema,
  familyId: familyIdSchema.nullable(),
  isDefault: z.boolean(),
});
