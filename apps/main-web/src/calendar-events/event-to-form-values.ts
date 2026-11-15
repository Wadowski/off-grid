// SPDX-FileCopyrightText: 2026 Dominik Wadowski
// SPDX-License-Identifier: FSL-1.1-ALv2

import { formatMinutesOfDay } from "../calendar-views/format-minutes-of-day.js";
import { zonedMomentOf } from "../calendar-views/time-format.js";
import type { EventFormSource, EventFormValues } from "./types.js";

export const eventToFormValues = (event: EventFormSource, timeZone: string): EventFormValues => {
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
      reminderOffsetsMinutes: event.reminderOffsetsMinutes ?? [],
    };
  }
  const start = zonedMomentOf(event.startsAt, timeZone);
  const end = zonedMomentOf(event.endsAt, timeZone);
  return {
    title: event.title,
    calendarId: event.calendarId,
    isAllDay: false,
    startDate: start.date,
    startTime: formatMinutesOfDay(start.minutesOfDay),
    endDate: end.date,
    endTime: formatMinutesOfDay(end.minutesOfDay),
    location: event.location ?? "",
    description: event.description ?? "",
    reminderOffsetsMinutes: event.reminderOffsetsMinutes ?? [],
  };
};
