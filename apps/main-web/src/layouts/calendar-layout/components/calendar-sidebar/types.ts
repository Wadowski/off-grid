// SPDX-FileCopyrightText: 2026 Dominik Wadowski
// SPDX-License-Identifier: FSL-1.1-ALv2

import type { ReactNode } from "react";
import type { HiddenCalendars } from "../../../../calendar-views/events-by-calendar.js";
import type { Calendar } from "../../../../calendars/types.js";

export type CalendarSidebarProps = {
  readonly calendars: readonly Calendar[];
  readonly hidden: HiddenCalendars;
  readonly onToggle: (calendarId: string) => void;
  readonly children?: ReactNode;
};
