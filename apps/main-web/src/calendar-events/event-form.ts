// SPDX-FileCopyrightText: 2026 Dominik Wadowski
// SPDX-License-Identifier: FSL-1.1-ALv2

import type { NewCalendarEventInput } from "@offgrid/contracts";
import { createCalendarEventRequestSchema, zonedLocalToInstant } from "@offgrid/contracts";
import { zonedMomentOf } from "../calendar-views/time-format.js";

const HOUR_MINUTES = 60;
const HOUR_MS = 60 * 60_000;
const END_BEFORE_START_MESSAGE = "The event must not end before it starts";

export type EventFormValues = {
  readonly title: string;
  readonly calendarId: string;
  readonly isAllDay: boolean;
  readonly startDate: string;
  readonly startTime: string;
  readonly endDate: string;
  readonly endTime: string;
  readonly location: string;
  readonly description: string;
};

export type EventFormErrors = {
  readonly title?: "titleRequired";
  readonly end?: "endsBeforeStart" | "invalid";
  readonly form?: "invalid";
};

export type EventFormResult =
  | { readonly ok: true; readonly request: NewCalendarEventInput }
  | { readonly ok: false; readonly errors: EventFormErrors };

// Splits a wall-clock millisecond value (read as UTC) into a date and a time.
const splitWallClock = (wallMs: number): { date: string; time: string } => {
  const iso = new Date(wallMs).toISOString();
  return { date: iso.slice(0, 10), time: iso.slice(11, 16) };
};

// The form opens on the next full hour in the person's time zone, lasting one hour.
export const defaultEventForm = (input: {
  readonly now: Date;
  readonly calendarId: string;
  readonly timeZone: string;
}): EventFormValues => {
  const moment = zonedMomentOf(input.now, input.timeZone);
  const startWall =
    Date.parse(`${moment.date}T00:00:00Z`) +
    Math.ceil(moment.minutesOfDay / HOUR_MINUTES) * HOUR_MS;
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

// Builds the create request from the form, using the same contract schema as the server.
// Times are converted from the person's time zone to UTC instants; all-day events keep dates.
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
    return { ok: false, errors: { form: "invalid" } };
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

const errorsFrom = (
  issues: readonly { readonly path: readonly PropertyKey[]; readonly message: string }[],
): EventFormErrors => {
  const errors: { title?: "titleRequired"; end?: "endsBeforeStart" | "invalid"; form?: "invalid" } =
    {};
  for (const issue of issues) {
    const field = String(issue.path[0] ?? "");
    if (field === "title") {
      errors.title = "titleRequired";
    } else if (field === "endsAt" || field === "endDate") {
      errors.end = issue.message === END_BEFORE_START_MESSAGE ? "endsBeforeStart" : "invalid";
    } else {
      errors.form = "invalid";
    }
  }
  return errors;
};
