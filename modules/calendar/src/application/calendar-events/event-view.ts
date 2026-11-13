// SPDX-FileCopyrightText: 2026 Dominik Wadowski
// SPDX-License-Identifier: FSL-1.1-ALv2

import { lastDayOf, localDate } from "../../domain/all-day-bounds.js";
import type { CalendarEventRecord } from "../../types.js";

export interface CalendarEventView extends CalendarEventRecord {
  readonly startDate: string | null;
  readonly endDate: string | null;
  readonly readOnly: boolean;
  readonly calendarName?: string;
  readonly calendarColor?: string;
}

export const toEventView = (
  record: CalendarEventRecord,
  timeZone: string,
  readOnly = false,
): CalendarEventView => ({
  ...record,
  startDate: record.isAllDay ? localDate(record.startsAt, timeZone) : null,
  endDate: record.isAllDay ? lastDayOf(record.endsAt, timeZone) : null,
  readOnly,
});
