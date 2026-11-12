// SPDX-FileCopyrightText: 2026 Dominik Wadowski
// SPDX-License-Identifier: FSL-1.1-ALv2

import { lastDayOf, localDate } from "../../domain/all-day-bounds.js";
import type { CalendarEventRecord } from "../../types.js";

export interface CalendarEventView extends CalendarEventRecord {
  // Calendar dates in the caller's zone. Set only for all-day events.
  readonly startDate: string | null;
  readonly endDate: string | null;
}

export const toEventView = (record: CalendarEventRecord, timeZone: string): CalendarEventView => ({
  ...record,
  startDate: record.isAllDay ? localDate(record.startsAt, timeZone) : null,
  endDate: record.isAllDay ? lastDayOf(record.endsAt, timeZone) : null,
});
