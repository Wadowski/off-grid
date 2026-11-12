// SPDX-FileCopyrightText: 2026 Dominik Wadowski
// SPDX-License-Identifier: FSL-1.1-ALv2

import { defineEvent } from "./define-event.js";
import { calendarEventPayloadSchema } from "./calendar-event-payload-schema.js";

export const calendarEventCreatedV1 = defineEvent({
  name: "calendar-event-created-v1",
  version: 1,
  schema: calendarEventPayloadSchema,
});
