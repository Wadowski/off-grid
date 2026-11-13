// SPDX-FileCopyrightText: 2026 Dominik Wadowski
// SPDX-License-Identifier: FSL-1.1-ALv2

// The ids of the calendars the person has unticked. Every calendar is shown unless it is listed here,
// so a calendar added later shows up without changing the filter.
export type HiddenCalendars = ReadonlySet<string>;

export const NO_HIDDEN_CALENDARS: HiddenCalendars = new Set<string>();

export const filterByCalendar = <Event extends { readonly calendarId: string }>(
  events: readonly Event[],
  hidden: HiddenCalendars,
): Event[] => events.filter((event) => !hidden.has(event.calendarId));

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
