// SPDX-FileCopyrightText: 2026 Dominik Wadowski
// SPDX-License-Identifier: FSL-1.1-ALv2

export const ALL_CALENDARS = "all";

export type CalendarFilter = typeof ALL_CALENDARS | string;

export const filterByCalendar = <Event extends { readonly calendarId: string }>(
  events: readonly Event[],
  filter: CalendarFilter,
): Event[] =>
  filter === ALL_CALENDARS ? [...events] : events.filter((event) => event.calendarId === filter);

export const sortByStart = <Event extends { readonly startsAt: string }>(
  events: readonly Event[],
): Event[] => [...events].sort((a, b) => a.startsAt.localeCompare(b.startsAt));

export const splitAllDay = <Event extends { readonly isAllDay: boolean }>(
  events: readonly Event[],
): { readonly allDay: Event[]; readonly timed: Event[] } => ({
  allDay: events.filter((event) => event.isAllDay),
  timed: events.filter((event) => !event.isAllDay),
});

export const distinctCalendarColors = <Event extends { readonly calendarColor: string }>(
  events: readonly Event[],
  limit: number,
): Event["calendarColor"][] => {
  const colors: Event["calendarColor"][] = [];
  for (const event of events) {
    if (colors.length >= limit) {
      break;
    }
    if (!colors.includes(event.calendarColor)) {
      colors.push(event.calendarColor);
    }
  }
  return colors;
};
