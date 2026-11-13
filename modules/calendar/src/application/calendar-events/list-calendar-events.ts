// SPDX-FileCopyrightText: 2026 Dominik Wadowski
// SPDX-License-Identifier: FSL-1.1-ALv2

import { withUserContext, type ModuleDatabase } from "@offgrid/db";
import { DEFAULT_TIME_ZONE } from "../../domain/time-zone.js";
import { findCalendar } from "../../infrastructure/calendars/find-calendar.js";
import { listEventsOfCalendar } from "../../infrastructure/calendar-events/list-events-of-calendar.js";
import { findTimeZone } from "../../infrastructure/time-zones/find-time-zone.js";
import type { CalendarOutcome } from "../../types.js";
import { findGuestCalendarFields } from "../event-guests/find-guest-calendar-fields.js";
import { findReadOnlyEventIds } from "../event-guests/find-read-only-event-ids.js";
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
    const readOnlyEventIds = await findReadOnlyEventIds(tx, { guestUserId: userId, records });
    const calendarFields = await findGuestCalendarFields(tx, calendarId);
    return {
      outcome: "found",
      value: records.map((record) => {
        const readOnly = readOnlyEventIds.has(record.eventId);
        const view = toEventView(record, timeZone, readOnly);
        return readOnly ? { ...view, ...calendarFields } : view;
      }),
    };
  });
