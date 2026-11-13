// SPDX-FileCopyrightText: 2026 Dominik Wadowski
// SPDX-License-Identifier: FSL-1.1-ALv2

import type { HiddenCalendars } from "../../../../calendar-views/events-by-calendar.js";
import type { Calendar } from "../../../../calendars/types.js";

export type CalendarMultiSelectProps = {
  readonly calendars: readonly Calendar[];
  readonly hidden: HiddenCalendars;
  readonly onChange: (hidden: HiddenCalendars) => void;
};
