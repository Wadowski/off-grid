// SPDX-FileCopyrightText: 2026 Dominik Wadowski
// SPDX-License-Identifier: FSL-1.1-ALv2

export const FORM_ID = "new-event-form";

export const NEW_EVENT_PATH = "/calendar/event/new";

export const EVENT_DETAILS_ROUTE = "event/:eventId";

export const DEFAULT_EVENT_BACKGROUND = "/calendar/agenda";

export const CALENDAR_PATH_PREFIX = "/calendar";

export const REMINDER_UNITS = ["minute", "hour", "day", "week"] as const;

export const REMINDER_UNIT_MINUTES = {
  minute: 1,
  hour: 60,
  day: 1440,
  week: 10080,
} as const;

export const DEFAULT_REMINDER_AMOUNT = "15";

export const DEFAULT_REMINDER_UNIT = "minute";

export const REMINDER_UNITS_LARGEST_FIRST = ["week", "day", "hour"] as const;
