// SPDX-FileCopyrightText: 2026 Dominik Wadowski
// SPDX-License-Identifier: FSL-1.1-ALv2

import { withUserContext, type ModuleDatabase } from "@offgrid/db";
import { publishCalendarEventRemoved } from "../../events/calendar-events/publish-calendar-event-removed.js";
import { deleteCalendar } from "../../infrastructure/calendars/delete-calendar.js";
import { findCalendar } from "../../infrastructure/calendars/find-calendar.js";
import { deleteEvents } from "../../infrastructure/calendar-events/delete-events.js";
import { listEventIdsOfCalendar } from "../../infrastructure/calendar-events/list-event-ids-of-calendar.js";
import type { CalendarRecord } from "../../types.js";

export type RemoveCalendarOutcome =
  | { readonly outcome: "found"; readonly value: CalendarRecord }
  | { readonly outcome: "not-found" }
  | { readonly outcome: "default-calendar" };

// The events, their guests and reminders, and the calendar go in one transaction,
// and each removed event is published in the same transaction.
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
    const eventIds = await listEventIdsOfCalendar(tx, calendarId);
    await deleteEvents(tx, eventIds);
    await deleteCalendar(tx, calendarId);
    for (const eventId of eventIds) {
      await publishCalendarEventRemoved(
        tx,
        { familyId: calendar.familyId, userId: calendar.userId },
        { eventId, calendarId },
      );
    }
    return { outcome: "found", value: calendar };
  });
