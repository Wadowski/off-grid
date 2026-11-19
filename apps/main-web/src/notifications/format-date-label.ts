// SPDX-FileCopyrightText: 2026 Dominik Wadowski
// SPDX-License-Identifier: FSL-1.1-ALv2

import { zonedMomentOf } from "../calendar-views/time-format.js";
import { formatClockTime24h } from "./format-clock-time-24h.js";
import { formatShortDate } from "./format-short-date.js";
import { isOtherYear } from "./is-other-year.js";
import { shiftDateKey } from "./shift-date-key.js";
import type { NotificationText } from "./types.js";

export const formatDateLabel = (now: Date, iso: string, timeZone: string): NotificationText => {
  const dateKey = zonedMomentOf(iso, timeZone).date;
  const todayKey = zonedMomentOf(now, timeZone).date;
  const time = formatClockTime24h(iso, timeZone);
  if (dateKey === shiftDateKey(todayKey, -1)) {
    return { textId: "notifications.time.yesterdayAt", values: { time } };
  }
  const withYear = isOtherYear(dateKey, todayKey);
  return {
    textId: withYear ? "notifications.time.dateWithYearAt" : "notifications.time.dateAt",
    values: { date: formatShortDate(dateKey, withYear), time },
  };
};
