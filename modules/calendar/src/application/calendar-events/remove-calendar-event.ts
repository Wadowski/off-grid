// SPDX-FileCopyrightText: 2026 Dominik Wadowski
// SPDX-License-Identifier: FSL-1.1-ALv2

import { withUserContext, type ModuleDatabase } from "@offgrid/db";
import { publishCalendarEventRemoved } from "../../events/calendar-events/publish-calendar-event-removed.js";
import { deleteEvents } from "../../infrastructure/calendar-events/delete-events.js";
import { findEvent } from "../../infrastructure/calendar-events/find-event.js";
import type { CalendarOutcome } from "../../types.js";

export const removeCalendarEvent = (
  db: ModuleDatabase,
  userId: string,
  eventId: string,
): Promise<CalendarOutcome<{ readonly eventId: string }>> =>
  db.$transaction(async (tx) => {
    await withUserContext(tx, userId);
    const record = await findEvent(tx, eventId);
    if (record === null) {
      return { outcome: "not-found" };
    }
    await deleteEvents(tx, [record.eventId]);
    await publishCalendarEventRemoved(
      tx,
      { familyId: record.familyId, userId: record.userId, sourceVersion: record.version + 1 },
      { eventId: record.eventId, calendarId: record.calendarId },
    );
    return { outcome: "found", value: { eventId: record.eventId } };
  });
