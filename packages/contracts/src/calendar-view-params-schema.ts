// SPDX-FileCopyrightText: 2026 Dominik Wadowski
// SPDX-License-Identifier: FSL-1.1-ALv2

import { z } from "zod";
import { eventDateSchema } from "./calendar-event-fields-schema.js";

export const CALENDAR_VIEWS = ["agenda", "day", "week", "month"] as const;

export const calendarViewKindSchema = z.enum(CALENDAR_VIEWS);

export type CalendarViewKind = (typeof CALENDAR_VIEWS)[number];

export const calendarViewParamsSchema = z.object({
  view: calendarViewKindSchema,
  date: eventDateSchema,
});
