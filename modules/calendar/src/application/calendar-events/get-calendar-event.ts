// SPDX-FileCopyrightText: 2026 Dominik Wadowski
// SPDX-License-Identifier: FSL-1.1-ALv2

import { withUserContext, type ModuleDatabase } from "@offgrid/db";
import { DEFAULT_TIME_ZONE } from "../../domain/time-zone.js";
import { findEvent } from "../../infrastructure/calendar-events/find-event.js";
import { findCalendar } from "../../infrastructure/calendars/find-calendar.js";
import { findGuestEventIds } from "../../infrastructure/event-guests/find-guest-events.js";
import { findTimeZone } from "../../infrastructure/time-zones/find-time-zone.js";
import type { CalendarOutcome } from "../../types.js";
import { toEventView, type CalendarEventView } from "./event-view.js";

export const getCalendarEvent = (
  db: ModuleDatabase,
  userId: string,
  eventId: string,
): Promise<CalendarOutcome<CalendarEventView>> =>
  db.$transaction(async (tx) => {
    await withUserContext(tx, userId);
    const record = await findEvent(tx, eventId);
    if (record === null) {
      return { outcome: "not-found" };
    }
    const timeZone = (await findTimeZone(tx, userId)) ?? DEFAULT_TIME_ZONE;
    const readOnly = (
      await findGuestEventIds(tx, { guestUserId: userId, eventIds: [record.eventId] })
    ).has(record.eventId);
    const view = toEventView(record, timeZone, readOnly);
    if (!readOnly) {
      return { outcome: "found", value: view };
    }
    const calendar = await findCalendar(tx, record.calendarId);
    return {
      outcome: "found",
      value: { ...view, calendarName: calendar?.name, calendarColor: calendar?.color },
    };
  });
