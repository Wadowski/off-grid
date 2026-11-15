// SPDX-FileCopyrightText: 2026 Dominik Wadowski
// SPDX-License-Identifier: FSL-1.1-ALv2

import {
  calendarIdSchema,
  type CalendarEventUpdateInput,
  createCalendarEventRequestSchema,
  END_BEFORE_START_REASON,
  zonedLocalToInstant,
} from "@offgrid/contracts";
import { zonedMomentOf } from "../calendar-views/time-format.js";
import { toIsoDate } from "../calendar-views/week-days.js";
import type {
  EventFormErrors,
  EventFormResult,
  EventFormValues,
  MutableEventFormErrors,
  ZodIssueLike,
} from "./types.js";

const HOUR_MINUTES = 60;
const HOUR_MS = 60 * 60_000;

const splitWallClock = (wallMs: number): { date: string; time: string } => ({
  date: toIsoDate(wallMs),
  time: new Date(wallMs).toISOString().slice(11, 16),
});

export const defaultEventForm = (input: {
  readonly now: Date;
  readonly calendarId: string;
  readonly timeZone: string;
}): EventFormValues => {
  const moment = zonedMomentOf(input.now, input.timeZone);
  const startWall =
    Date.parse(`${moment.date}T00:00:00Z`) +
    (Math.floor(moment.minutesOfDay / HOUR_MINUTES) + 1) * HOUR_MS;
  const start = splitWallClock(startWall);
  const end = splitWallClock(startWall + HOUR_MS);
  return {
    title: "",
    calendarId: input.calendarId,
    isAllDay: false,
    startDate: start.date,
    startTime: start.time,
    endDate: end.date,
    endTime: end.time,
    location: "",
    description: "",
  };
};

export const withField = <K extends keyof EventFormValues>(
  values: EventFormValues,
  field: K,
  value: EventFormValues[K],
): EventFormValues => ({ ...values, [field]: value });

const optionalText = (value: string): string | undefined => {
  const trimmed = value.trim();
  return trimmed === "" ? undefined : trimmed;
};

export const toCreateEventRequest = (
  values: EventFormValues,
  timeZone: string,
): EventFormResult => {
  const location = optionalText(values.location);
  const description = optionalText(values.description);
  const common = {
    title: values.title.trim(),
    ...(location === undefined ? {} : { location }),
    ...(description === undefined ? {} : { description }),
  };

  const candidate = values.isAllDay
    ? { ...common, isAllDay: true, startDate: values.startDate, endDate: values.endDate }
    : timedCandidate(values, common, timeZone);
  if (candidate === undefined) {
    return { ok: false, errors: { form: "incomplete" } };
  }

  const parsed = createCalendarEventRequestSchema.safeParse(candidate);
  if (parsed.success) {
    return { ok: true, request: parsed.data };
  }
  return { ok: false, errors: errorsFrom(parsed.error.issues) };
};

const timedCandidate = (
  values: EventFormValues,
  common: { readonly title: string },
  timeZone: string,
) => {
  const startsAt = zonedLocalToInstant(values.startDate, values.startTime, timeZone);
  const endsAt = zonedLocalToInstant(values.endDate, values.endTime, timeZone);
  if (startsAt === undefined || endsAt === undefined) {
    return undefined;
  }
  return {
    ...common,
    isAllDay: false,
    startsAt: startsAt.toISOString(),
    endsAt: endsAt.toISOString(),
  };
};

const errorsFrom = (issues: readonly ZodIssueLike[]): EventFormErrors => {
  const errors: MutableEventFormErrors = {};
  for (const issue of issues) {
    const field = String(issue.path[0] ?? "");
    if (field === "title") {
      errors.title = issue.code === "too_big" ? "titleTooLong" : "titleRequired";
    } else if (field === "endsAt" || field === "endDate") {
      const endsBeforeStart =
        issue.code === "custom" && issue.params?.reason === END_BEFORE_START_REASON;
      errors.end = endsBeforeStart ? "endsBeforeStart" : "invalid";
    } else {
      errors.form = "invalid";
    }
  }
  return errors;
};

const clockOf = (minutesOfDay: number): string =>
  `${String(Math.floor(minutesOfDay / HOUR_MINUTES)).padStart(2, "0")}:${String(
    minutesOfDay % HOUR_MINUTES,
  ).padStart(2, "0")}`;

export const eventToFormValues = (
  event: {
    readonly calendarId: string;
    readonly title: string;
    readonly location: string | null;
    readonly description: string | null;
    readonly isAllDay: boolean;
    readonly startsAt: string;
    readonly endsAt: string;
    readonly startDate: string | null;
    readonly endDate: string | null;
  },
  timeZone: string,
): EventFormValues => {
  if (event.isAllDay) {
    return {
      title: event.title,
      calendarId: event.calendarId,
      isAllDay: true,
      startDate: event.startDate ?? "",
      startTime: "00:00",
      endDate: event.endDate ?? "",
      endTime: "00:00",
      location: event.location ?? "",
      description: event.description ?? "",
    };
  }
  const start = zonedMomentOf(event.startsAt, timeZone);
  const end = zonedMomentOf(event.endsAt, timeZone);
  return {
    title: event.title,
    calendarId: event.calendarId,
    isAllDay: false,
    startDate: start.date,
    startTime: clockOf(start.minutesOfDay),
    endDate: end.date,
    endTime: clockOf(end.minutesOfDay),
    location: event.location ?? "",
    description: event.description ?? "",
  };
};

export type EventUpdateResult =
  | { readonly ok: true; readonly request: CalendarEventUpdateInput | undefined }
  | { readonly ok: false; readonly errors: EventFormErrors };

// Sends only the fields that differ from the event as it was loaded.
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
