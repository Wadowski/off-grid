// SPDX-FileCopyrightText: 2026 Dominik Wadowski
// SPDX-License-Identifier: FSL-1.1-ALv2

import type { Calendar } from "../../../../../../calendars/types.js";

export type CalendarSidebarToggleRowProps = {
  readonly calendar: Calendar;
  readonly checked: boolean;
  readonly onToggle: (calendarId: string) => void;
};
