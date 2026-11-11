// SPDX-FileCopyrightText: 2026 Dominik Wadowski
// SPDX-License-Identifier: FSL-1.1-ALv2

import type { SubscriberClient } from "../../types.js";

// The default calendar is never deleted. Returns false when no row was deleted,
// which includes the default calendar and calendars that row-level security hides.
export const deleteCalendar = async (
  client: SubscriberClient,
  calendarId: string,
): Promise<boolean> => {
  const result = await client.query(
    "DELETE FROM calendar.calendar WHERE calendar_id = $1 AND is_default = false",
    [calendarId],
  );
  return (result.rowCount ?? 0) > 0;
};
