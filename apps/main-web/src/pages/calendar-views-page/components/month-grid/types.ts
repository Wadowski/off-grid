// SPDX-FileCopyrightText: 2026 Dominik Wadowski
// SPDX-License-Identifier: FSL-1.1-ALv2

import type {
  CalendarViewDay,
  CalendarViewEvent,
} from "../../../../calendar-views/use-calendar-view.js";

export type MonthGridProps = {
  readonly days: readonly CalendarViewDay[];
  readonly selectedDate: string;
  readonly todayDate: string;
  readonly timeZone: string;
  readonly selectedEvents: readonly CalendarViewEvent[];
  readonly onSelect: (date: string) => void;
};
