// SPDX-FileCopyrightText: 2026 Dominik Wadowski
// SPDX-License-Identifier: FSL-1.1-ALv2

import { type ZonedParts, zonedParts } from "./zoned-parts.js";

const SECOND_MS = 1000;
const DATE_PATTERN = /^(\d{4})-(\d{2})-(\d{2})$/;
const TIME_PATTERN = /^(\d{2}):(\d{2})$/;
const MONTH_DAYS = [31, 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31] as const;

const offsetAt = (instant: number, timeZone: string): number => {
  const instantSeconds = Math.floor(instant / SECOND_MS) * SECOND_MS;
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

const isLeapYear = (year: number): boolean =>
  (year % 4 === 0 && year % 100 !== 0) || year % 400 === 0;

const daysIn = (year: number, month: number): number =>
  month === 2 && isLeapYear(year) ? 29 : (MONTH_DAYS[month - 1] ?? 0);

const parseWall = (date: string, time: string): Omit<ZonedParts, "second"> | undefined => {
  const dateMatch = DATE_PATTERN.exec(date);
  const timeMatch = TIME_PATTERN.exec(time);
  if (dateMatch === null || timeMatch === null) {
    return undefined;
  }
  const year = Number(dateMatch[1]);
  const month = Number(dateMatch[2]);
  const day = Number(dateMatch[3]);
  const hour = Number(timeMatch[1]);
  const minute = Number(timeMatch[2]);
  if (month < 1 || month > 12 || day < 1 || day > daysIn(year, month)) {
    return undefined;
  }
  if (hour > 23 || minute > 59) {
    return undefined;
  }
  return { year, month, day, hour, minute };
};

export const zonedLocalToInstant = (
  date: string,
  time: string,
  timeZone: string,
): Date | undefined => {
  const wall = parseWall(date, time);
  if (wall === undefined) {
    return undefined;
  }
  const asUtc = Date.UTC(wall.year, wall.month - 1, wall.day, wall.hour, wall.minute);
  const firstGuess = asUtc - offsetAt(asUtc, timeZone);
  return new Date(asUtc - offsetAt(firstGuess, timeZone));
};
