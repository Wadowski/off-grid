// SPDX-FileCopyrightText: 2026 Dominik Wadowski
// SPDX-License-Identifier: FSL-1.1-ALv2

import { calendarColorSchema } from "./calendar-color-schema.js";
import { calendarEventSchema } from "./calendar-event-schema.js";
import { nameSchema } from "./name-schema.js";

export const calendarViewEventSchema = calendarEventSchema.extend({
  calendarName: nameSchema,
  calendarColor: calendarColorSchema,
});
