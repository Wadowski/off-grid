// SPDX-FileCopyrightText: 2026 Dominik Wadowski
// SPDX-License-Identifier: FSL-1.1-ALv2

export type CalendarMiniMonthProps = {
  // The selected date (YYYY-MM-DD). Its month is shown.
  readonly selectedDate: string;
  readonly todayDate: string;
  readonly onSelect: (date: string) => void;
};
