// SPDX-FileCopyrightText: 2026 Dominik Wadowski
// SPDX-License-Identifier: FSL-1.1-ALv2

import { z } from "zod";
import { calendarEventSchema } from "./calendar-event-schema.js";

export const calendarEventListSchema = z.object({
  events: z.array(calendarEventSchema),
});
