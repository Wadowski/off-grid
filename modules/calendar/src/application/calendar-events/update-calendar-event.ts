// SPDX-FileCopyrightText: 2026 Dominik Wadowski
// SPDX-License-Identifier: FSL-1.1-ALv2

import { isValidDayWindow, isValidEventWindow } from "@offgrid/contracts";
import { withUserContext, type ModuleDatabase, type ModuleTransaction } from "@offgrid/db";
import { EventMoveOwnerMismatchError } from "../errors/event-move-owner-mismatch-error.js";
import { allDayBounds, lastDayOf, localDate } from "../../domain/all-day-bounds.js";
import { DEFAULT_TIME_ZONE } from "../../domain/time-zone.js";
import { publishCalendarEventUpdated } from "../../events/calendar-events/publish-calendar-event-updated.js";
import { findCalendar } from "../../infrastructure/calendars/find-calendar.js";
import { findEvent } from "../../infrastructure/calendar-events/find-event.js";
import { updateEvent } from "../../infrastructure/calendar-events/update-event.js";
import { findTimeZone } from "../../infrastructure/time-zones/find-time-zone.js";
import type {
  CalendarEventRecord,
  CalendarEventUpdateInput,
  CalendarOutcome,
} from "../../types.js";
import { toEventView, type CalendarEventView } from "./event-view.js";

export type UpdateCalendarEventOutcome =
  CalendarOutcome<CalendarEventView> | { readonly outcome: "invalid-window" };

// The timing fields that a change writes. An empty object leaves the window as it is.
interface WindowChange {
  readonly isAllDay?: boolean;
  readonly startsAt?: Date;
  readonly endsAt?: Date;
}

// A moved event keeps its owner, so the target calendar must have the same owner.
// The mismatch error is thrown before any write, so nothing is stored or published.
export const updateCalendarEvent = (
  db: ModuleDatabase,
  userId: string,
  eventId: string,
  input: CalendarEventUpdateInput,
): Promise<UpdateCalendarEventOutcome> =>
  db.$transaction(async (tx) => {
    await withUserContext(tx, userId);
    const current = await findEvent(tx, eventId);
    if (current === null) {
      return { outcome: "not-found" };
    }
    const calendarId = await resolveTargetCalendar(tx, current, input.calendarId);
    if (calendarId === "not-found") {
      return { outcome: "not-found" };
    }
    const timeZone = (await findTimeZone(tx, userId)) ?? DEFAULT_TIME_ZONE;
    const window = windowChange(current, input, timeZone);
    if (window === null) {
      return { outcome: "invalid-window" };
    }
    const record = await updateEvent(tx, eventId, {
      title: input.title,
      location: input.location,
      description: input.description,
      calendarId,
      ...window,
    });
    await publishCalendarEventUpdated(tx, record);
    return { outcome: "found", value: toEventView(record, timeZone) };
  });

const resolveTargetCalendar = async (
  tx: ModuleTransaction,
  current: CalendarEventRecord,
  requested: string | undefined,
): Promise<string | undefined | "not-found"> => {
  if (requested === undefined) {
    return undefined;
  }
  const target = await findCalendar(tx, requested);
  if (target === null) {
    return "not-found";
  }
  if (target.familyId !== current.familyId || target.userId !== current.userId) {
    throw new EventMoveOwnerMismatchError();
  }
  return target.calendarId;
};

// Returns null when the window that results from the merge is not valid.
// A change that sends only one bound takes the other bound from the stored event.
// Sending the other kind of timing switches the event's kind.
const windowChange = (
  current: CalendarEventRecord,
  input: CalendarEventUpdateInput,
  timeZone: string,
): WindowChange | null => {
  const timedRequested = input.startsAt !== undefined || input.endsAt !== undefined;
  const allDayRequested = input.startDate !== undefined || input.endDate !== undefined;
  if (timedRequested && allDayRequested) {
    return null;
  }
  if (allDayRequested) {
    const startDate = input.startDate ?? localDate(current.startsAt, timeZone);
    const endDate = input.endDate ?? lastDayOf(current.endsAt, timeZone);
    if (!isValidDayWindow({ startDate, endDate })) {
      return null;
    }
    return { isAllDay: true, ...allDayBounds({ startDate, endDate, timeZone }) };
  }
  if (timedRequested) {
    const startsAt = input.startsAt === undefined ? current.startsAt : new Date(input.startsAt);
    const endsAt = input.endsAt === undefined ? current.endsAt : new Date(input.endsAt);
    if (!isValidEventWindow({ startsAt, endsAt })) {
      return null;
    }
    return { isAllDay: false, startsAt, endsAt };
  }
  return {};
};
