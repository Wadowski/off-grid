// SPDX-FileCopyrightText: 2026 Dominik Wadowski
// SPDX-License-Identifier: FSL-1.1-ALv2

import type { CalendarEventView } from "../../application/calendar-events/event-view.js";

export const toCalendarEvent = (view: CalendarEventView) => ({
  id: view.eventId,
  calendarId: view.calendarId,
  title: view.title,
  location: view.location,
  description: view.description,
  isAllDay: view.isAllDay,
  startsAt: view.startsAt.toISOString(),
  endsAt: view.endsAt.toISOString(),
  startDate: view.startDate,
  endDate: view.endDate,
});
