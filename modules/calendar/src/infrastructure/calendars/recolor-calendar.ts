// SPDX-FileCopyrightText: 2026 Dominik Wadowski
// SPDX-License-Identifier: FSL-1.1-ALv2

import type { CalendarColor } from "../../domain/calendar-colors.js";
import { calendarColorSchema } from "../../domain/calendar-schemas.js";
import type { SubscriberClient } from "../../types.js";

export const recolorCalendar = async (
  client: SubscriberClient,
  input: { readonly calendarId: string; readonly color: CalendarColor },
): Promise<void> => {
  await client.query("UPDATE calendar.calendar SET color = $2 WHERE calendar_id = $1", [
    input.calendarId,
    calendarColorSchema.parse(input.color),
  ]);
};
