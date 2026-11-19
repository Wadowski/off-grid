// SPDX-FileCopyrightText: 2026 Dominik Wadowski
// SPDX-License-Identifier: FSL-1.1-ALv2

import { formatShortDate } from "./format-short-date.js";
import { isOtherYear } from "./is-other-year.js";
import type { DayGroupLabel } from "./types.js";

export const dayGroupLabel = (
  dateKey: string,
  todayKey: string,
  yesterdayKey: string,
): DayGroupLabel => {
  if (dateKey === todayKey) {
    return { textId: "notifications.groups.today" };
  }
  if (dateKey === yesterdayKey) {
    return { textId: "notifications.groups.yesterday" };
  }
  return { value: formatShortDate(dateKey, isOtherYear(dateKey, todayKey)) };
};
