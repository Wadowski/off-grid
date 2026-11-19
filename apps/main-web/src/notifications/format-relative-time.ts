// SPDX-FileCopyrightText: 2026 Dominik Wadowski
// SPDX-License-Identifier: FSL-1.1-ALv2

import { browserTimeZone } from "./browser-time-zone.js";
import { DAY_MS, HOUR_MS, MINUTE_MS } from "./constants.js";
import { formatDateLabel } from "./format-date-label.js";
import type { NotificationText } from "./types.js";

export const formatRelativeTime = (
  now: Date,
  iso: string,
  timeZone = browserTimeZone(),
): NotificationText => {
  const ageMs = now.getTime() - new Date(iso).getTime();
  if (ageMs < MINUTE_MS) {
    return { textId: "notifications.time.justNow" };
  }
  if (ageMs < HOUR_MS) {
    return { textId: "notifications.time.minutesAgo", values: { count: Math.floor(ageMs / MINUTE_MS) } };
  }
  if (ageMs < DAY_MS) {
    return { textId: "notifications.time.hoursAgo", values: { count: Math.floor(ageMs / HOUR_MS) } };
  }
  return formatDateLabel(now, iso, timeZone);
};
