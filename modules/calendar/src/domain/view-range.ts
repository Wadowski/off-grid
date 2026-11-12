// SPDX-FileCopyrightText: 2026 Dominik Wadowski
// SPDX-License-Identifier: FSL-1.1-ALv2

import type { CalendarViewKind } from "@offgrid/contracts";
import { addDays, localMidnight } from "./all-day-bounds.js";

export interface ViewRange {
  readonly startDate: string;
  readonly endDate: string;
  readonly startsAt: Date;
  readonly endsAt: Date;
}

const AGENDA_DAYS = 7;
const WEEK_DAYS = 7;

const mondayOffset = (date: string): number => {
  const [year = 0, month = 1, day = 1] = date.split("-").map(Number);
  const weekday = new Date(Date.UTC(year, month - 1, day)).getUTCDay();
  return (weekday + 6) % 7;
};

const monthRange = (date: string): { startDate: string; endDate: string } => {
  const [year = 0, month = 1] = date.split("-").map(Number);
  const daysInMonth = new Date(Date.UTC(year, month, 0)).getUTCDate();
  const startDate = `${date.slice(0, 8)}01`;
  return { startDate, endDate: addDays(startDate, daysInMonth - 1) };
};

const dateRangeOf = (
  view: CalendarViewKind,
  date: string,
): { startDate: string; endDate: string } => {
  switch (view) {
    case "day":
      return { startDate: date, endDate: date };
    case "agenda":
      return { startDate: date, endDate: addDays(date, AGENDA_DAYS - 1) };
    case "week": {
      const startDate = addDays(date, -mondayOffset(date));
      return { startDate, endDate: addDays(startDate, WEEK_DAYS - 1) };
    }
    case "month":
      return monthRange(date);
  }
};

export const viewRange = (input: {
  readonly view: CalendarViewKind;
  readonly date: string;
  readonly timeZone: string;
}): ViewRange => {
  const { startDate, endDate } = dateRangeOf(input.view, input.date);
  return {
    startDate,
    endDate,
    startsAt: localMidnight(startDate, input.timeZone),
    endsAt: localMidnight(addDays(endDate, 1), input.timeZone),
  };
};
