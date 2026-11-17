// SPDX-FileCopyrightText: 2026 Dominik Wadowski
// SPDX-License-Identifier: FSL-1.1-ALv2

import { calendarDayDifference } from "./calendar-day-difference.js";
import { calendarDayInZone } from "./calendar-day-in-zone.js";
import type { FileDateLabel } from "./types.js";

export const formatFileDate = (
  modifiedAt: Date,
  now: Date,
  locale?: string,
  timeZone?: string,
): FileDateLabel => {
  const modifiedDay = calendarDayInZone(modifiedAt, timeZone);
  const today = calendarDayInZone(now, timeZone);
  const daysAgo = calendarDayDifference(today, modifiedDay);
  if (daysAgo === 0) {
    const time = new Intl.DateTimeFormat(locale, {
      hour: "2-digit",
      minute: "2-digit",
      timeZone,
    }).format(modifiedAt);
    return { kind: "today", time };
  }
  if (daysAgo === 1) {
    return { kind: "yesterday" };
  }
  const text = new Intl.DateTimeFormat(locale, {
    month: "short",
    day: "numeric",
    year: modifiedDay.year === today.year ? undefined : "numeric",
    timeZone,
  }).format(modifiedAt);
  return { kind: "date", text };
};
