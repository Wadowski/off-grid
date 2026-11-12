// SPDX-FileCopyrightText: 2026 Dominik Wadowski
// SPDX-License-Identifier: FSL-1.1-ALv2

import { z } from "zod";
import { calendarViewEventSchema } from "./calendar-view-event-schema.js";
import { calendarViewKindSchema } from "./calendar-view-params-schema.js";
import { eventDateSchema } from "./calendar-event-fields-schema.js";

export const calendarViewDaySchema = z.object({
  date: eventDateSchema,
  events: z.array(calendarViewEventSchema),
});

export const calendarViewSchema = z.object({
  view: calendarViewKindSchema,
  startDate: eventDateSchema,
  endDate: eventDateSchema,
  days: z.array(calendarViewDaySchema),
});
