// SPDX-FileCopyrightText: 2026 Dominik Wadowski
// SPDX-License-Identifier: FSL-1.1-ALv2

import {
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
