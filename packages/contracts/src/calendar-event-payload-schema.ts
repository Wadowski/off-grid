// SPDX-FileCopyrightText: 2026 Dominik Wadowski
// SPDX-License-Identifier: FSL-1.1-ALv2

import { z } from "zod";
import {
  eventDescriptionSchema,
  eventLocationSchema,
  eventTitleSchema,
} from "./calendar-event-fields-schema.js";
import { timestampSchema } from "./timestamp-schema.js";
import { uuidSchema } from "./uuid-schema.js";

export const calendarEventPayloadSchema = z.object({
  eventId: uuidSchema,
  calendarId: uuidSchema,
  title: eventTitleSchema,
  location: eventLocationSchema.nullable(),
  description: eventDescriptionSchema.nullable(),
  startsAt: timestampSchema,
  endsAt: timestampSchema,
  isAllDay: z.boolean(),
  version: z.number().int().min(1),
});
