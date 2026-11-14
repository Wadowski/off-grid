// SPDX-FileCopyrightText: 2026 Dominik Wadowski
// SPDX-License-Identifier: FSL-1.1-ALv2

const DAY_MS = 24 * 60 * 60 * 1000;

const parseDate = (date: string): { year: number; month: number; day: number } => {
  const [year = 0, month = 1, day = 1] = date.split("-").map(Number);
  return { year, month, day };
};

export const toIsoDate = (time: number): string => new Date(time).toISOString().slice(0, 10);

export const addDays = (date: string, days: number): string => {
  const { year, month, day } = parseDate(date);
  return toIsoDate(Date.UTC(year, month - 1, day + days));
};

export const addMonths = (date: string, months: number): string => {
  const { year, month, day } = parseDate(date);
  const firstOfTarget = Date.UTC(year, month - 1 + months, 1);
  const target = new Date(firstOfTarget);
  const daysInTarget = new Date(
    Date.UTC(target.getUTCFullYear(), target.getUTCMonth() + 1, 0),
  ).getUTCDate();
  return toIsoDate(
    Date.UTC(target.getUTCFullYear(), target.getUTCMonth(), Math.min(day, daysInTarget)),
  );
};

export const mondayOf = (date: string): string => {
  const { year, month, day } = parseDate(date);
  const weekday = new Date(Date.UTC(year, month - 1, day)).getUTCDay();
  return addDays(date, -((weekday + 6) % 7));
};

export const weekDates = (monday: string): readonly string[] =>
  Array.from({ length: 7 }, (_, offset) => addDays(monday, offset));

export const daysBetween = (from: string, to: string): number => {
  const start = parseDate(from);
  const end = parseDate(to);
  return Math.round(
    (Date.UTC(end.year, end.month - 1, end.day) -
      Date.UTC(start.year, start.month - 1, start.day)) /
      DAY_MS,
  );
};

export const localDateOf = (now: Date): string =>
  `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}-${String(now.getDate()).padStart(2, "0")}`;

const WEEKDAY = new Intl.DateTimeFormat("en-US", { weekday: "short", timeZone: "UTC" });

export const weekDayLabel = (date: string): string => WEEKDAY.format(new Date(`${date}T00:00:00Z`));

export const weekDayNumber = (date: string): number => Number(date.slice(8, 10));

export const isoWeekNumber = (monday: string): number => {
  const thursday = addDays(monday, 3);
  const { year } = parseDate(thursday);
  const dayOfYear = daysBetween(`${year}-01-01`, thursday) + 1;
  return Math.floor((dayOfYear - 1) / 7) + 1;
};

export const mondayIndexOf = (date: string): number => {
  const { year, month, day } = parseDate(date);
  return (new Date(Date.UTC(year, month - 1, day)).getUTCDay() + 6) % 7;
};
