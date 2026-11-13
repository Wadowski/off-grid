// SPDX-FileCopyrightText: 2026 Dominik Wadowski
// SPDX-License-Identifier: FSL-1.1-ALv2

import { zonedMomentOf } from "./time-format.js";
import { daysBetween } from "./week-days.js";

export const WEEK_DEFAULT_START_HOUR = 8;
export const WEEK_DEFAULT_END_HOUR = 21;

export type WeekGridRange = { readonly startHour: number; readonly endHour: number };

type TimedSpan = { readonly startsAt: string; readonly endsAt: string };

export const weekGridRange = (events: readonly TimedSpan[], timeZone: string): WeekGridRange => {
  let startHour = WEEK_DEFAULT_START_HOUR;
  let endHour = WEEK_DEFAULT_END_HOUR;
  for (const event of events) {
    const start = zonedMomentOf(event.startsAt, timeZone).minutesOfDay;
    const end = zonedMomentOf(event.endsAt, timeZone).minutesOfDay;
    startHour = Math.min(startHour, Math.floor(start / 60));
    endHour = Math.max(endHour, Math.ceil(end / 60));
  }
  return { startHour, endHour: Math.min(24, endHour) };
};

export type ColumnSpan = { readonly startColumn: number; readonly endColumn: number };

export const columnSpanInWeek = (
  startDate: string,
  endDate: string,
  weekDates: readonly string[],
): ColumnSpan | null => {
  const first = weekDates[0];
  const last = weekDates[weekDates.length - 1];
  if (first === undefined || last === undefined || endDate < first || startDate > last) {
    return null;
  }
  const from = startDate < first ? first : startDate;
  const to = endDate > last ? last : endDate;
  return { startColumn: daysBetween(first, from), endColumn: daysBetween(first, to) };
};
