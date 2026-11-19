// SPDX-FileCopyrightText: 2026 Dominik Wadowski
// SPDX-License-Identifier: FSL-1.1-ALv2

import { zonedMomentOf } from "../calendar-views/time-format.js";
import { dayGroupLabel } from "./day-group-label.js";
import { shiftDateKey } from "./shift-date-key.js";
import type { DatedItem, DayGroup } from "./types.js";

export const groupByDay = <T extends DatedItem>(
  items: readonly T[],
  now: Date,
  timeZone: string,
): readonly DayGroup<T>[] => {
  const todayKey = zonedMomentOf(now, timeZone).date;
  const yesterdayKey = shiftDateKey(todayKey, -1);
  const itemsByDate = items.reduce<Map<string, readonly T[]>>((groups, item) => {
    const dateKey = zonedMomentOf(item.createdAt, timeZone).date;
    return groups.set(dateKey, [...(groups.get(dateKey) ?? []), item]);
  }, new Map());
  return [...itemsByDate].map(([dateKey, groupItems]) => ({
    dateKey,
    label: dayGroupLabel(dateKey, todayKey, yesterdayKey),
    items: groupItems,
  }));
};
