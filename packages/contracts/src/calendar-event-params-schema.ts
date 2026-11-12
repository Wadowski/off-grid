// SPDX-FileCopyrightText: 2026 Dominik Wadowski
// SPDX-License-Identifier: FSL-1.1-ALv2

import { z } from "zod";
import { calendarEventIdSchema } from "./calendar-event-id-schema.js";

export const calendarEventParamsSchema = z.object({
  id: calendarEventIdSchema,
});
