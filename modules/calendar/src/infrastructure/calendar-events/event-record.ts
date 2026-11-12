// SPDX-FileCopyrightText: 2026 Dominik Wadowski
// SPDX-License-Identifier: FSL-1.1-ALv2

import type { CalendarEventRecord } from "../../types.js";

export interface CalendarEventRow {
  readonly eventId: string;
  readonly calendarId: string;
  readonly familyId: string | null;
  readonly userId: string | null;
  readonly title: string;
  readonly location: string | null;
  readonly description: string | null;
  readonly isAllDay: boolean;
  readonly startsAt: Date;
  readonly endsAt: Date;
  readonly version: number;
}

export const toEventRecord = (row: CalendarEventRow): CalendarEventRecord => ({
  eventId: row.eventId,
  calendarId: row.calendarId,
  familyId: row.familyId,
  userId: row.userId,
  title: row.title,
  location: row.location,
  description: row.description,
  isAllDay: row.isAllDay,
  startsAt: row.startsAt,
  endsAt: row.endsAt,
  version: row.version,
});
