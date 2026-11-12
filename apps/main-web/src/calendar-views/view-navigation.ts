// SPDX-FileCopyrightText: 2026 Dominik Wadowski
// SPDX-License-Identifier: FSL-1.1-ALv2

import { CALENDAR_VIEWS, type CalendarViewKind } from "@offgrid/contracts";
import { addDays, addMonths, mondayOf } from "./week-days.js";

export const DEFAULT_CALENDAR_VIEW: CalendarViewKind = "agenda";

export const isCalendarViewKind = (value: string | undefined): value is CalendarViewKind =>
  CALENDAR_VIEWS.some((view) => view === value);

export const shiftDate = (date: string, view: CalendarViewKind, step: 1 | -1): string => {
  switch (view) {
    case "agenda":
    case "week":
      return addDays(date, 7 * step);
    case "day":
      return addDays(date, step);
    case "month":
      return addMonths(date, step);
  }
};

export const requestDateFor = (view: CalendarViewKind, date: string): string =>
  view === "agenda" ? mondayOf(date) : date;

const MONTH_YEAR = new Intl.DateTimeFormat("en-US", {
  month: "long",
  year: "numeric",
  timeZone: "UTC",
});
const SHORT_DAY = new Intl.DateTimeFormat("en-US", {
  month: "short",
  day: "numeric",
  timeZone: "UTC",
});
const DAY_OF_MONTH = new Intl.DateTimeFormat("en-US", { day: "numeric", timeZone: "UTC" });

const utcDate = (date: string): Date => new Date(`${date}T00:00:00Z`);

export const periodLabel = (view: CalendarViewKind, date: string): string => {
  if (view === "week") {
    const monday = mondayOf(date);
    const sunday = addDays(monday, 6);
    const sameMonth = monday.slice(0, 7) === sunday.slice(0, 7);
    const end = sameMonth
      ? DAY_OF_MONTH.format(utcDate(sunday))
      : SHORT_DAY.format(utcDate(sunday));
    return `${SHORT_DAY.format(utcDate(monday))} - ${end}`;
  }
  return MONTH_YEAR.format(utcDate(date));
};
