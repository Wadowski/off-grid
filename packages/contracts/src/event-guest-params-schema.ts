// SPDX-FileCopyrightText: 2026 Dominik Wadowski
// SPDX-License-Identifier: FSL-1.1-ALv2

import { z } from "zod";
import { calendarEventIdSchema } from "./calendar-event-id-schema.js";
import { uuidSchema } from "./uuid-schema.js";

export const eventGuestParamsSchema = z.object({
  id: calendarEventIdSchema,
  guestUserId: uuidSchema,
});
