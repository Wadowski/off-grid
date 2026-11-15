// SPDX-FileCopyrightText: 2026 Dominik Wadowski
// SPDX-License-Identifier: FSL-1.1-ALv2

import { addDays, mondayIndexOf } from "./week-days.js";

export type MonthCell = { readonly date: string; readonly inMonth: boolean };

export const monthCells = (monthDates: readonly string[]): MonthCell[] => {
  const first = monthDates[0];
  const last = monthDates[monthDates.length - 1];
  if (first === undefined || last === undefined) {
    return [];
  }
  const leading = mondayIndexOf(first);
  const used = leading + monthDates.length;
  const trailing = (7 - (used % 7)) % 7;
  const before = Array.from({ length: leading }, (_, index) => ({
    date: addDays(first, index - leading),
    inMonth: false,
  }));
  const inMonth = monthDates.map((date) => ({ date, inMonth: true }));
  const after = Array.from({ length: trailing }, (_, index) => ({
    date: addDays(last, index + 1),
    inMonth: false,
  }));
  return [...before, ...inMonth, ...after];
};
