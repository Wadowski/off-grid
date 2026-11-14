// SPDX-FileCopyrightText: 2026 Dominik Wadowski
// SPDX-License-Identifier: FSL-1.1-ALv2

export const calendarRoutes = {
  calendars: "/calendars",
  calendar: "/calendars/:id",
  calendarView: "/calendar/views/:view",
  calendarTimeZone: "/calendar/time-zone",
  calendarEvents: "/calendars/:id/events",
  eventGuests: "/events/:id/guests",
} as const;
