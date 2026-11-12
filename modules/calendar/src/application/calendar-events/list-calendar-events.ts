// SPDX-FileCopyrightText: 2026 Dominik Wadowski
// SPDX-License-Identifier: FSL-1.1-ALv2

import { withUserContext, type ModuleDatabase } from "@offgrid/db";
import { DEFAULT_TIME_ZONE } from "../../domain/time-zone.js";
import { findCalendar } from "../../infrastructure/calendars/find-calendar.js";
import { listEventsOfCalendar } from "../../infrastructure/calendar-events/list-events-of-calendar.js";
import { findTimeZone } from "../../infrastructure/time-zones/find-time-zone.js";
import type { CalendarOutcome } from "../../types.js";
import { toEventView, type CalendarEventView } from "./event-view.js";

export const listCalendarEvents = (
  db: ModuleDatabase,
  userId: string,
  calendarId: string,
): Promise<CalendarOutcome<CalendarEventView[]>> =>
  db.$transaction(async (tx) => {
    await withUserContext(tx, userId);
    if ((await findCalendar(tx, calendarId)) === null) {
      return { outcome: "not-found" };
    }
    const timeZone = (await findTimeZone(tx, userId)) ?? DEFAULT_TIME_ZONE;
    const records = await listEventsOfCalendar(tx, calendarId);
    return { outcome: "found", value: records.map((record) => toEventView(record, timeZone)) };
  });
