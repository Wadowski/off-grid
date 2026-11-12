// SPDX-FileCopyrightText: 2026 Dominik Wadowski
// SPDX-License-Identifier: FSL-1.1-ALv2

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

// Offset of the zone from UTC at this instant, in milliseconds.
const offsetAt = (instant: number, timeZone: string): number => {
  const instantSeconds = Math.floor(instant / 1000) * 1000;
  const parts = zonedParts(new Date(instantSeconds), timeZone);
  const asUtc = Date.UTC(
    parts.year,
    parts.month - 1,
    parts.day,
    parts.hour,
    parts.minute,
    parts.second,
  );
  return asUtc - instantSeconds;
};

const parseDay = (date: string): { year: number; month: number; day: number } => {
  const [year, month, day] = date.split("-").map(Number);
  return { year: year ?? 0, month: month ?? 1, day: day ?? 1 };
};

const formatDay = (utcMs: number): string => new Date(utcMs).toISOString().slice(0, 10);

// The UTC instant of local midnight at the start of a calendar date in a zone.
export const localMidnight = (date: string, timeZone: string): Date => {
  const { year, month, day } = parseDay(date);
  const asUtc = Date.UTC(year, month - 1, day);
  const firstGuess = asUtc - offsetAt(asUtc, timeZone);
  const refined = asUtc - offsetAt(firstGuess, timeZone);
  return new Date(refined);
};

export const nextDay = (date: string): string => {
  const { year, month, day } = parseDay(date);
  return formatDay(Date.UTC(year, month - 1, day + 1));
};

export const allDayBounds = (input: {
  readonly startDate: string;
  readonly endDate: string;
  readonly timeZone: string;
}): { readonly startsAt: Date; readonly endsAt: Date } => ({
  startsAt: localMidnight(input.startDate, input.timeZone),
  endsAt: localMidnight(nextDay(input.endDate), input.timeZone),
});

// The calendar date an instant falls on in a zone.
export const localDate = (instant: Date, timeZone: string): string => {
  const { year, month, day } = zonedParts(instant, timeZone);
  return formatDay(Date.UTC(year, month - 1, day));
};

// The inclusive last date covered by an all-day window that ends at endsAt.
export const lastDayOf = (endsAt: Date, timeZone: string): string =>
  localDate(new Date(endsAt.getTime() - 1), timeZone);
