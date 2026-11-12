// SPDX-FileCopyrightText: 2026 Dominik Wadowski
// SPDX-License-Identifier: FSL-1.1-ALv2

import { withUserContext, type ModuleDatabase } from "@offgrid/db";
import { CalendarRemovedConcurrentlyError } from "../errors/calendar-removed-concurrently-error.js";
import { publishCalendarEventRemoved } from "../../events/calendar-events/publish-calendar-event-removed.js";
import { deleteCalendar } from "../../infrastructure/calendars/delete-calendar.js";
import { findCalendar } from "../../infrastructure/calendars/find-calendar.js";
import { deleteEvents } from "../../infrastructure/calendar-events/delete-events.js";
import { listEventsOfCalendar } from "../../infrastructure/calendar-events/list-events-of-calendar.js";
import type { RemoveCalendarOutcome } from "../../types.js";

export const removeCalendar = (
  db: ModuleDatabase,
  userId: string,
  calendarId: string,
): Promise<RemoveCalendarOutcome> =>
  db.$transaction(async (tx) => {
    await withUserContext(tx, userId);
    const calendar = await findCalendar(tx, calendarId);
    if (calendar === null) {
      return { outcome: "not-found" };
    }
    if (calendar.isDefault) {
      return { outcome: "default-calendar" };
    }
    const events = await listEventsOfCalendar(tx, calendarId);
    await deleteEvents(
      tx,
      events.map((event) => event.eventId),
    );
    if (!(await deleteCalendar(tx, calendarId))) {
      throw new CalendarRemovedConcurrentlyError();
    }
    for (const event of events) {
      await publishCalendarEventRemoved(
        tx,
        { familyId: calendar.familyId, userId: calendar.userId, sourceVersion: event.version + 1 },
        { eventId: event.eventId, calendarId },
      );
    }
    return { outcome: "found", value: calendar };
  });
