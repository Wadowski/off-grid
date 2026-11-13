// SPDX-FileCopyrightText: 2026 Dominik Wadowski
// SPDX-License-Identifier: FSL-1.1-ALv2

import type { CalendarViewResult } from "../../application/views/list-calendar-view.js";
import type { CalendarViewEventView } from "../../application/views/calendar-view-event-view.js";

const toCalendarViewEvent = (view: CalendarViewEventView) => ({
  id: view.eventId,
  calendarId: view.calendarId,
  calendarName: view.calendarName,
  calendarColor: view.calendarColor,
  title: view.title,
  location: view.location,
  description: view.description,
  isAllDay: view.isAllDay,
  startsAt: view.startsAt.toISOString(),
  endsAt: view.endsAt.toISOString(),
  startDate: view.startDate,
  endDate: view.endDate,
  readOnly: view.readOnly,
});

export const toCalendarView = (result: CalendarViewResult) => ({
  view: result.view,
  startDate: result.startDate,
  endDate: result.endDate,
  days: result.days.map((day) => ({
    date: day.date,
    events: day.events.map(toCalendarViewEvent),
  })),
});
