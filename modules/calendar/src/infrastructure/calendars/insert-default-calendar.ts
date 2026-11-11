// SPDX-FileCopyrightText: 2026 Dominik Wadowski
// SPDX-License-Identifier: FSL-1.1-ALv2

import { DEFAULT_CALENDAR_COLOR, DEFAULT_CALENDAR_NAME } from "../../domain/default-calendar.js";
import type { SubscriberClient } from "../../types.js";

// A repeat for the same user does nothing: the partial unique index on
// is_default allows one default calendar per user.
export const insertDefaultCalendar = async (
  client: SubscriberClient,
  input: { readonly calendarId: string; readonly userId: string },
): Promise<void> => {
  await client.query(
    `INSERT INTO calendar.calendar (calendar_id, user_id, name, color, is_default)
     VALUES ($1, $2, $3, $4, true)
     ON CONFLICT (user_id) WHERE is_default DO NOTHING`,
    [input.calendarId, input.userId, DEFAULT_CALENDAR_NAME, DEFAULT_CALENDAR_COLOR],
  );
};
