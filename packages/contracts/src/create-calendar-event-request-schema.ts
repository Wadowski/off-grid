// SPDX-FileCopyrightText: 2026 Dominik Wadowski
// SPDX-License-Identifier: FSL-1.1-ALv2

import { z } from "zod";
import {
  eventDateSchema,
  eventDescriptionSchema,
  eventInstantSchema,
  eventLocationSchema,
  eventTitleSchema,
} from "./calendar-event-fields-schema.js";

const commonFields = {
  title: eventTitleSchema,
  location: eventLocationSchema.optional(),
  description: eventDescriptionSchema.optional(),
};

const timedEventRequestSchema = z
  .strictObject({
    ...commonFields,
    isAllDay: z.literal(false),
    startsAt: eventInstantSchema,
    endsAt: eventInstantSchema,
  })
  .refine((value) => Date.parse(value.endsAt) >= Date.parse(value.startsAt), {
    message: "The event must not end before it starts",
    path: ["endsAt"],
  });

const allDayEventRequestSchema = z
  .strictObject({
    ...commonFields,
    isAllDay: z.literal(true),
    startDate: eventDateSchema,
    endDate: eventDateSchema,
  })
  .refine((value) => value.endDate >= value.startDate, {
    message: "The event must not end before it starts",
    path: ["endDate"],
  });

export const createCalendarEventRequestSchema = z.discriminatedUnion("isAllDay", [
  timedEventRequestSchema,
  allDayEventRequestSchema,
]);
