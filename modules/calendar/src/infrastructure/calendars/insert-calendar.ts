// SPDX-FileCopyrightText: 2026 Dominik Wadowski
// SPDX-License-Identifier: FSL-1.1-ALv2

import type { CalendarColor } from "../../domain/calendar-colors.js";
import { calendarColorSchema, calendarNameSchema } from "../../domain/calendar-schemas.js";
import type { SubscriberClient } from "../../types.js";

interface NewCalendar {
  readonly calendarId: string;
  readonly familyId?: string;
  readonly userId?: string;
  readonly name: string;
  readonly color: CalendarColor;
}

// The table requires exactly one of familyId or userId; the database refuses both or neither.
export const insertCalendar = async (
  client: SubscriberClient,
  input: NewCalendar,
): Promise<void> => {
  await client.query(
    `INSERT INTO calendar.calendar (calendar_id, family_id, user_id, name, color)
     VALUES ($1, $2, $3, $4, $5)`,
    [
      input.calendarId,
      input.familyId ?? null,
      input.userId ?? null,
      calendarNameSchema.parse(input.name),
      calendarColorSchema.parse(input.color),
    ],
  );
};
