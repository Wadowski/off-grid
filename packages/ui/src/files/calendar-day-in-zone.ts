// SPDX-FileCopyrightText: 2026 Dominik Wadowski
// SPDX-License-Identifier: FSL-1.1-ALv2

import { readDayPart } from "./read-day-part.js";
import type { CalendarDay } from "./types.js";

export const calendarDayInZone = (date: Date, timeZone?: string): CalendarDay => {
  const parts = new Intl.DateTimeFormat("en-US", {
    timeZone,
    year: "numeric",
    month: "numeric",
    day: "numeric",
  }).formatToParts(date);
  return {
    year: readDayPart(parts, "year"),
    month: readDayPart(parts, "month"),
    day: readDayPart(parts, "day"),
  };
};
