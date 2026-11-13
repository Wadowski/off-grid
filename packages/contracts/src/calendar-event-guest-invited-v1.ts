// SPDX-FileCopyrightText: 2026 Dominik Wadowski
// SPDX-License-Identifier: FSL-1.1-ALv2

import { z } from "zod";
import { defineEvent } from "./define-event.js";
import { uuidSchema } from "./uuid-schema.js";

export const calendarEventGuestInvitedV1 = defineEvent({
  name: "calendar-event-guest-invited-v1",
  version: 1,
  schema: z.strictObject({
    eventId: uuidSchema,
    guestUserId: uuidSchema,
  }),
});
