// SPDX-FileCopyrightText: 2026 Dominik Wadowski
// SPDX-License-Identifier: FSL-1.1-ALv2

import { calendarNameSchema } from "../../domain/calendar-schemas.js";
import type { SubscriberClient } from "../../types.js";

export const renameCalendar = async (
  client: SubscriberClient,
  input: { readonly calendarId: string; readonly name: string },
): Promise<void> => {
  await client.query("UPDATE calendar.calendar SET name = $2 WHERE calendar_id = $1", [
    input.calendarId,
    calendarNameSchema.parse(input.name),
  ]);
};
