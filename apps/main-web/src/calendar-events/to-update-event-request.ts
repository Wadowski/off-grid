// SPDX-FileCopyrightText: 2026 Dominik Wadowski
// SPDX-License-Identifier: FSL-1.1-ALv2

import { calendarIdSchema, type CalendarEventUpdateInput } from "@offgrid/contracts";
import { optionalText } from "./optional-text.js";
import { toCreateEventRequest } from "./event-form.js";
import { sameReminderOffsets } from "./same-reminder-offsets.js";
import type { EventFormValues, EventUpdateResult } from "./types.js";

export const toUpdateEventRequest = (
  initial: EventFormValues,
  values: EventFormValues,
  timeZone: string,
): EventUpdateResult => {
  const next = toCreateEventRequest(values, timeZone);
  if (!next.ok) {
    return next;
  }
  const previous = toCreateEventRequest(initial, timeZone);
  if (!previous.ok) {
    return { ok: false, errors: { form: "invalid" } };
  }
  const update: CalendarEventUpdateInput = {};
  if (next.request.title !== previous.request.title) {
    update.title = next.request.title;
  }
  const location = optionalText(values.location) ?? null;
  if (location !== (optionalText(initial.location) ?? null)) {
    update.location = location;
  }
  const description = optionalText(values.description) ?? null;
  if (description !== (optionalText(initial.description) ?? null)) {
    update.description = description;
  }
  if (values.calendarId !== initial.calendarId) {
    const calendarId = calendarIdSchema.safeParse(values.calendarId);
    if (!calendarId.success) {
      return { ok: false, errors: { form: "invalid" } };
    }
    update.calendarId = calendarId.data;
  }
  if (!sameReminderOffsets(values.reminderOffsetsMinutes, initial.reminderOffsetsMinutes)) {
    update.reminderOffsetsMinutes = [...values.reminderOffsetsMinutes];
  }
  const request = next.request;
  if (request.isAllDay !== previous.request.isAllDay) {
    if (request.isAllDay) {
      update.startDate = request.startDate;
      update.endDate = request.endDate;
    } else {
      update.startsAt = request.startsAt;
      update.endsAt = request.endsAt;
    }
  } else if (request.isAllDay) {
    const before = previous.request;
    if (before.isAllDay) {
      if (request.startDate !== before.startDate) {
        update.startDate = request.startDate;
      }
      if (request.endDate !== before.endDate) {
        update.endDate = request.endDate;
      }
    }
  } else {
    const before = previous.request;
    if (!before.isAllDay) {
      if (request.startsAt !== before.startsAt) {
        update.startsAt = request.startsAt;
      }
      if (request.endsAt !== before.endsAt) {
        update.endsAt = request.endsAt;
      }
    }
  }
  return { ok: true, request: Object.keys(update).length === 0 ? undefined : update };
};
