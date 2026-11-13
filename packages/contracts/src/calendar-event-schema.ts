// SPDX-FileCopyrightText: 2026 Dominik Wadowski
// SPDX-License-Identifier: FSL-1.1-ALv2

import { z } from "zod";
import { calendarEventIdSchema } from "./calendar-event-id-schema.js";
import { calendarIdSchema } from "./calendar-id-schema.js";
import {
  eventDateSchema,
  eventDescriptionSchema,
  eventLocationSchema,
  eventTitleSchema,
} from "./calendar-event-fields-schema.js";
import { calendarColorSchema } from "./calendar-color-schema.js";
import { nameSchema } from "./name-schema.js";
import { timestampSchema } from "./timestamp-schema.js";

export const calendarEventSchema = z.object({
  id: calendarEventIdSchema,
  calendarId: calendarIdSchema,
  title: eventTitleSchema,
  location: eventLocationSchema.nullable(),
  description: eventDescriptionSchema.nullable(),
  isAllDay: z.boolean(),
  startsAt: timestampSchema,
  endsAt: timestampSchema,
  startDate: eventDateSchema.nullable(),
  endDate: eventDateSchema.nullable(),
  readOnly: z.boolean(),
  calendarName: nameSchema.optional(),
  calendarColor: calendarColorSchema.optional(),
});
