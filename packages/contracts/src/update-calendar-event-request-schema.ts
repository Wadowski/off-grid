// SPDX-FileCopyrightText: 2026 Dominik Wadowski
// SPDX-License-Identifier: FSL-1.1-ALv2

import { z } from "zod";
import { calendarIdSchema } from "./calendar-id-schema.js";
import {
  eventDateSchema,
  eventDescriptionSchema,
  eventInstantSchema,
  eventLocationSchema,
  eventTitleSchema,
} from "./calendar-event-fields-schema.js";

export const updateCalendarEventRequestSchema = z
  .strictObject({
    title: eventTitleSchema.optional(),
    location: eventLocationSchema.nullable().optional(),
    description: eventDescriptionSchema.nullable().optional(),
    calendarId: calendarIdSchema.optional(),
    startsAt: eventInstantSchema.optional(),
    endsAt: eventInstantSchema.optional(),
    startDate: eventDateSchema.optional(),
    endDate: eventDateSchema.optional(),
  })
  .refine((value) => Object.values(value).some((field) => field !== undefined), {
    message: "Send at least one field to change",
  })
  .refine(
    (value) =>
      !(
        (value.startsAt !== undefined || value.endsAt !== undefined) &&
        (value.startDate !== undefined || value.endDate !== undefined)
      ),
    { message: "Send either timed fields or all-day fields, not both" },
  );
