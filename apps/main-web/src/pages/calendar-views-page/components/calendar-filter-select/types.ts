// SPDX-FileCopyrightText: 2026 Dominik Wadowski
// SPDX-License-Identifier: FSL-1.1-ALv2

import type { Calendar } from "../../../../calendars/types.js";
import type { CalendarFilter } from "../../../../calendar-views/events-by-calendar.js";

export type CalendarFilterSelectProps = {
  readonly calendars: readonly Calendar[];
  readonly selected: CalendarFilter;
  readonly onSelect: (filter: CalendarFilter) => void;
};
