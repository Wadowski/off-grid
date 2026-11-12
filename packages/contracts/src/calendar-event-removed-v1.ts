// SPDX-FileCopyrightText: 2026 Dominik Wadowski
// SPDX-License-Identifier: FSL-1.1-ALv2

import { z } from "zod";
import { defineEvent } from "./define-event.js";
import { uuidSchema } from "./uuid-schema.js";

export const calendarEventRemovedV1 = defineEvent({
  name: "calendar-event-removed-v1",
  version: 1,
  schema: z.object({
    eventId: uuidSchema,
    calendarId: uuidSchema,
  }),
});
