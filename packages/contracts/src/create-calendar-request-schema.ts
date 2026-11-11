// SPDX-FileCopyrightText: 2026 Dominik Wadowski
// SPDX-License-Identifier: FSL-1.1-ALv2

import { z } from "zod";
import { calendarColorSchema } from "./calendar-color-schema.js";
import { familyIdSchema } from "./family-id-schema.js";
import { nameSchema } from "./name-schema.js";

// Without a familyId the calendar is personal to the caller.
export const createCalendarRequestSchema = z.object({
  name: nameSchema,
  color: calendarColorSchema,
  familyId: familyIdSchema.optional(),
});
