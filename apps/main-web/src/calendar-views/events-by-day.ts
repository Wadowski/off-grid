// SPDX-FileCopyrightText: 2026 Dominik Wadowski
// SPDX-License-Identifier: FSL-1.1-ALv2

import { zonedMomentOf } from "./time-format.js";
import { addDays, daysBetween } from "./week-days.js";

export type DayEventSpan = {
  readonly id: string;
  readonly isAllDay: boolean;
  readonly startsAt: string;
  readonly endsAt: string;
  readonly startDate: string | null;
  readonly endDate: string | null;
};

// The local dates a person sees an event on, inclusive. A timed event that ends at 00:00 does not
// reach the day it ends on. An all-day event uses its day window.
export const eventDaySpan = (
  event: DayEventSpan,
  timeZone: string,
): { readonly first: string; readonly last: string } => {
  if (event.isAllDay && event.startDate !== null && event.endDate !== null) {
    return { first: event.startDate, last: event.endDate };
  }
  const first = zonedMomentOf(event.startsAt, timeZone);
  const end = zonedMomentOf(event.endsAt, timeZone);
  const endsAtMidnight = end.minutesOfDay === 0 && end.date > first.date;
  const last = endsAtMidnight ? addDays(end.date, -1) : end.date;
  return { first: first.date, last: last < first.date ? first.date : last };
};

// Maps each date in `dates` to the events whose local day span covers it, including multi-day
// events that start before the first date. Dates outside `dates` are not listed.
export const eventsByDay = <Event extends DayEventSpan>(
  events: readonly Event[],
  dates: readonly string[],
  timeZone: string,
): Map<string, Event[]> => {
  const byDay = new Map<string, Event[]>(dates.map((date) => [date, []]));
  const firstDate = dates[0];
  const lastDate = dates[dates.length - 1];
  if (firstDate === undefined || lastDate === undefined) {
    return byDay;
  }
  for (const event of events) {
    const span = eventDaySpan(event, timeZone);
    if (span.last < firstDate || span.first > lastDate) {
      continue;
    }
    const days = daysBetween(span.first, span.last);
    for (let offset = 0; offset <= days; offset += 1) {
      byDay.get(addDays(span.first, offset))?.push(event);
    }
  }
  return byDay;
};
