// SPDX-FileCopyrightText: 2026 Dominik Wadowski
// SPDX-License-Identifier: FSL-1.1-ALv2

import { z } from "zod";
import { calendarSchema } from "./calendar-schema.js";

export const calendarListSchema = z.object({
  calendars: z.array(calendarSchema),
});
