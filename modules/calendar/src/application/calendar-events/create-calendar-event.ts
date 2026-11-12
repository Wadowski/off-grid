// SPDX-FileCopyrightText: 2026 Dominik Wadowski
// SPDX-License-Identifier: FSL-1.1-ALv2

import { randomUUID } from "node:crypto";
import type { NewCalendarEventInput } from "@offgrid/contracts";
import { withUserContext, type ModuleDatabase } from "@offgrid/db";
import { allDayBounds } from "../../domain/all-day-bounds.js";
import { DEFAULT_TIME_ZONE } from "../../domain/time-zone.js";
import { publishCalendarEventCreated } from "../../events/calendar-events/publish-calendar-event-created.js";
import { findCalendar } from "../../infrastructure/calendars/find-calendar.js";
import { insertEvent } from "../../infrastructure/calendar-events/insert-event.js";
import { findTimeZone } from "../../infrastructure/time-zones/find-time-zone.js";
import type { CalendarOutcome } from "../../types.js";
import { toEventView, type CalendarEventView } from "./event-view.js";

export const createCalendarEvent = (
  db: ModuleDatabase,
  userId: string,
  calendarId: string,
  input: NewCalendarEventInput,
): Promise<CalendarOutcome<CalendarEventView>> =>
  db.$transaction(async (tx) => {
    await withUserContext(tx, userId);
    const calendar = await findCalendar(tx, calendarId);
    if (calendar === null) {
      return { outcome: "not-found" };
    }
    const timeZone = (await findTimeZone(tx, userId)) ?? DEFAULT_TIME_ZONE;
    const window = input.isAllDay
      ? allDayBounds({ startDate: input.startDate, endDate: input.endDate, timeZone })
      : { startsAt: new Date(input.startsAt), endsAt: new Date(input.endsAt) };
    const record = await insertEvent(tx, {
      eventId: randomUUID(),
      calendarId,
      familyId: calendar.familyId ?? undefined,
      userId: calendar.userId ?? undefined,
      title: input.title,
      location: input.location ?? null,
      description: input.description ?? null,
      isAllDay: input.isAllDay,
      startsAt: window.startsAt,
      endsAt: window.endsAt,
    });
    await publishCalendarEventCreated(tx, record);
    return { outcome: "found", value: toEventView(record, timeZone) };
  });
