// SPDX-FileCopyrightText: 2026 Dominik Wadowski
// SPDX-License-Identifier: FSL-1.1-ALv2

import { withUserContext, type ModuleDatabase } from "@offgrid/db";
import { publishCalendarEventRemoved } from "../../events/calendar-events/publish-calendar-event-removed.js";
import { deleteCalendar } from "../../infrastructure/calendars/delete-calendar.js";
import { findCalendar } from "../../infrastructure/calendars/find-calendar.js";
import { deleteEvents } from "../../infrastructure/calendar-events/delete-events.js";
import { listEventIdsOfCalendar } from "../../infrastructure/calendar-events/list-event-ids-of-calendar.js";
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
    const eventIds = await listEventIdsOfCalendar(tx, calendarId);
    await deleteEvents(tx, eventIds);
    if (!(await deleteCalendar(tx, calendarId))) {
      throw new Error("calendar was removed by another request while its events were deleted");
    }
    for (const eventId of eventIds) {
      await publishCalendarEventRemoved(
        tx,
        { familyId: calendar.familyId, userId: calendar.userId },
        { eventId, calendarId },
      );
    }
    return { outcome: "found", value: calendar };
  });
