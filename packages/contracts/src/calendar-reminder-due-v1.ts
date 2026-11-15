// SPDX-FileCopyrightText: 2026 Dominik Wadowski
// SPDX-License-Identifier: FSL-1.1-ALv2

import { z } from "zod";
import { defineEvent } from "./define-event.js";
import { uuidSchema } from "./uuid-schema.js";

export const calendarReminderDueV1 = defineEvent({
  name: "calendar-reminder-due-v1",
  version: 1,
  schema: z.strictObject({
    eventId: uuidSchema,
    userId: uuidSchema,
  }),
});
