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

export const REMINDER_ERROR_TEXT_IDS = {
  empty: "calendar.eventModal.reminders.errors.empty",
  notWhole: "calendar.eventModal.reminders.errors.notWhole",
  negative: "calendar.eventModal.reminders.errors.negative",
  tooLarge: "calendar.eventModal.reminders.errors.tooLarge",
  duplicate: "calendar.eventModal.reminders.errors.duplicate",
} as const;

export const REMINDER_UNIT_TEXT_KEYS = {
  minute: "calendar.eventModal.reminders.units.minute",
  hour: "calendar.eventModal.reminders.units.hour",
  day: "calendar.eventModal.reminders.units.day",
  week: "calendar.eventModal.reminders.units.week",
} as const;
