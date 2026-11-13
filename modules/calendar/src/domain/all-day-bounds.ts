// SPDX-FileCopyrightText: 2026 Dominik Wadowski
// SPDX-License-Identifier: FSL-1.1-ALv2

import { zonedLocalToInstant } from "@offgrid/contracts";

interface ZonedParts {
  readonly year: number;
  readonly month: number;
  readonly day: number;
  readonly hour: number;
  readonly minute: number;
  readonly second: number;
}

const zonedParts = (instant: Date, timeZone: string): ZonedParts => {
  const parts = new Intl.DateTimeFormat("en-US", {
    timeZone,
    hourCycle: "h23",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
  }).formatToParts(instant);
  const value = (type: string): number =>
    Number(parts.find((part) => part.type === type)?.value ?? "0");
  return {
    year: value("year"),
    month: value("month"),
    day: value("day"),
    hour: value("hour"),
    minute: value("minute"),
    second: value("second"),
  };
};

const parseDay = (date: string): { year: number; month: number; day: number } => {
  const [year, month, day] = date.split("-").map(Number);
  return { year: year ?? 0, month: month ?? 1, day: day ?? 1 };
};

const formatDay = (utcMs: number): string => new Date(utcMs).toISOString().slice(0, 10);

export const localMidnight = (date: string, timeZone: string): Date =>
  zonedLocalToInstant(date, "00:00", timeZone) ?? new Date(Number.NaN);

export const addDays = (date: string, days: number): string => {
  const { year, month, day } = parseDay(date);
  return formatDay(Date.UTC(year, month - 1, day + days));
};

export const allDayBounds = (input: {
  readonly startDate: string;
  readonly endDate: string;
  readonly timeZone: string;
}): { readonly startsAt: Date; readonly endsAt: Date } => ({
  startsAt: localMidnight(input.startDate, input.timeZone),
  endsAt: localMidnight(addDays(input.endDate, 1), input.timeZone),
});

export const localDate = (instant: Date, timeZone: string): string => {
  const { year, month, day } = zonedParts(instant, timeZone);
  return formatDay(Date.UTC(year, month - 1, day));
};

export const lastDayOf = (endsAt: Date, timeZone: string): string =>
  localDate(new Date(endsAt.getTime() - 1), timeZone);
