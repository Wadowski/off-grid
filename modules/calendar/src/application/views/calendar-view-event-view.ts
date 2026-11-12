// SPDX-FileCopyrightText: 2026 Dominik Wadowski
// SPDX-License-Identifier: FSL-1.1-ALv2

import type { CalendarEventView } from "../calendar-events/event-view.js";

export interface CalendarViewEventView extends CalendarEventView {
  readonly calendarName: string;
  readonly calendarColor: string;
}
