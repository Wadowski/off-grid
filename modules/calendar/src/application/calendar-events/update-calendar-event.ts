// SPDX-FileCopyrightText: 2026 Dominik Wadowski
// SPDX-License-Identifier: FSL-1.1-ALv2

import {
  isValidDayWindow,
  isValidEventWindow,
  type CalendarEventUpdateInput,
} from "@offgrid/contracts";
import { withUserContext, type ModuleDatabase, type ModuleTransaction } from "@offgrid/db";
import { assertNotGuestWrite } from "../event-guests/assert-not-guest-write.js";
import { EventMoveOwnerMismatchError } from "../errors/event-move-owner-mismatch-error.js";
import { allDayBounds, lastDayOf, localDate } from "../../domain/all-day-bounds.js";
import { DEFAULT_TIME_ZONE } from "../../domain/time-zone.js";
import { publishCalendarEventUpdated } from "../../events/calendar-events/publish-calendar-event-updated.js";
import { findCalendar } from "../../infrastructure/calendars/find-calendar.js";
import { findEvent } from "../../infrastructure/calendar-events/find-event.js";
import { findEventGuest } from "../../infrastructure/event-guests/find-event-guest.js";
import { updateEvent } from "../../infrastructure/calendar-events/update-event.js";
import { findOwnReminderOffsets } from "../../infrastructure/reminders/find-own-reminder-offsets.js";
import { replaceEventReminders } from "../../infrastructure/reminders/replace-event-reminders.js";
import { findTimeZone } from "../../infrastructure/time-zones/find-time-zone.js";
import type { CalendarEventRecord, CalendarOutcome } from "../../types.js";
import { toEventView, type CalendarEventView } from "./event-view.js";

export type UpdateCalendarEventOutcome =
  CalendarOutcome<CalendarEventView> | { readonly outcome: "invalid-window" };

interface WindowChange {
  readonly isAllDay?: boolean;
  readonly startsAt?: Date;
  readonly endsAt?: Date;
}

export const updateCalendarEvent = (
  db: ModuleDatabase,
  userId: string,
  eventId: string,
  input: CalendarEventUpdateInput,
  now: Date = new Date(),
): Promise<UpdateCalendarEventOutcome> =>
  db.$transaction(async (tx) => {
    await withUserContext(tx, userId);
    const current = await findEvent(tx, eventId);
    if (current === null) {
      return { outcome: "not-found" };
    }
    if (isReminderOnly(input)) {
      return setOwnReminders(tx, current, userId, input.reminderOffsetsMinutes ?? [], now);
    }
    await assertNotGuestWrite(tx, current, userId);
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
    if (input.reminderOffsetsMinutes !== undefined || Object.keys(window).length > 0) {
      await replaceEventReminders(tx, {
        eventId: record.eventId,
        userId,
        startsAt: record.startsAt,
        offsetsMinutes:
          input.reminderOffsetsMinutes ??
          (await findOwnReminderOffsets(tx, record.eventId, userId)),
        now,
      });
    }
    await publishCalendarEventUpdated(tx, record);
    return {
      outcome: "found",
      value: {
        ...toEventView(record, timeZone),
        reminderOffsetsMinutes: await findOwnReminderOffsets(tx, record.eventId, userId),
      },
    };
  });

// Reminders belong to the user who sets them, so a guest may change only their own reminders.
// Those changes touch no event field, so they publish nothing.
const isReminderOnly = (input: CalendarEventUpdateInput): boolean =>
  input.reminderOffsetsMinutes !== undefined &&
  Object.entries(input).every(
    ([key, value]) => value === undefined || key === "reminderOffsetsMinutes",
  );

const setOwnReminders = async (
  tx: ModuleTransaction,
  current: CalendarEventRecord,
  userId: string,
  offsetsMinutes: readonly number[],
  now: Date,
): Promise<UpdateCalendarEventOutcome> => {
  await replaceEventReminders(tx, {
    eventId: current.eventId,
    userId,
    startsAt: current.startsAt,
    offsetsMinutes,
    now,
  });
  const timeZone = (await findTimeZone(tx, userId)) ?? DEFAULT_TIME_ZONE;
  const readOnly = await findEventGuest(tx, { eventId: current.eventId, guestUserId: userId });
  return {
    outcome: "found",
    value: {
      ...toEventView(current, timeZone, readOnly),
      reminderOffsetsMinutes: await findOwnReminderOffsets(tx, current.eventId, userId),
    },
  };
};

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
