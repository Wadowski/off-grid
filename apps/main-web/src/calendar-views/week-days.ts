// SPDX-FileCopyrightText: 2026 Dominik Wadowski
// SPDX-License-Identifier: FSL-1.1-ALv2

const DAY_MS = 24 * 60 * 60 * 1000;

const parseDate = (date: string): { year: number; month: number; day: number } => {
  const [year = 0, month = 1, day = 1] = date.split("-").map(Number);
  return { year, month, day };
};

const toIsoDate = (time: number): string => new Date(time).toISOString().slice(0, 10);

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
