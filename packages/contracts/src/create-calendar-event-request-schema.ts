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
import { isValidDayWindow } from "./is-valid-day-window.js";
import { isValidEventWindow } from "./is-valid-event-window.js";

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
  .refine(
    (value) =>
      isValidEventWindow({ startsAt: new Date(value.startsAt), endsAt: new Date(value.endsAt) }),
    {
      message: "The event must not end before it starts",
      path: ["endsAt"],
    },
  );

const allDayEventRequestSchema = z
  .strictObject({
    ...commonFields,
    isAllDay: z.literal(true),
    startDate: eventDateSchema,
    endDate: eventDateSchema,
  })
  .refine((value) => isValidDayWindow({ startDate: value.startDate, endDate: value.endDate }), {
    message: "The event must not end before it starts",
    path: ["endDate"],
  });

export const createCalendarEventRequestSchema = z.discriminatedUnion("isAllDay", [
  timedEventRequestSchema,
  allDayEventRequestSchema,
]);
