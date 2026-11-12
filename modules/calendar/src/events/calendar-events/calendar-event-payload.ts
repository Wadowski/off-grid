// SPDX-FileCopyrightText: 2026 Dominik Wadowski
// SPDX-License-Identifier: FSL-1.1-ALv2

import type { CalendarEventRecord } from "../../types.js";

// The full state of the event after a change, so a projection can upsert it.
export const toCalendarEventPayload = (record: CalendarEventRecord) => ({
  eventId: record.eventId,
  calendarId: record.calendarId,
  title: record.title,
  location: record.location,
  description: record.description,
  startsAt: record.startsAt.toISOString(),
  endsAt: record.endsAt.toISOString(),
  isAllDay: record.isAllDay,
  version: record.version,
});
