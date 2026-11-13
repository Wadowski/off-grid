// SPDX-FileCopyrightText: 2026 Dominik Wadowski
// SPDX-License-Identifier: FSL-1.1-ALv2

import type {
  CalendarViewKind,
  CreateCalendarRequest,
  UpdateCalendarRequest,
} from "@offgrid/contracts";
import {
  calendarListSchema,
  calendarRoutes,
  calendarSchema,
  calendarTimeZoneSchema,
  calendarViewSchema,
} from "@offgrid/contracts";
import type { ApiClient } from "./types.js";

const withCalendarId = (path: string, id: string): string =>
  path.replace(":id", encodeURIComponent(id));

export const createCalendarClient = (client: ApiClient) => ({
  listCalendars: async () =>
    calendarListSchema.parse(await client.request("GET", calendarRoutes.calendars)).calendars,

  createCalendar: async (input: CreateCalendarRequest) =>
    calendarSchema.parse(await client.request("POST", calendarRoutes.calendars, input)),

  updateCalendar: async (id: string, input: UpdateCalendarRequest) =>
    calendarSchema.parse(
      await client.request("PATCH", withCalendarId(calendarRoutes.calendar, id), input),
    ),

  removeCalendar: async (id: string): Promise<void> => {
    await client.request("DELETE", withCalendarId(calendarRoutes.calendar, id));
  },

  getCalendarView: async (view: CalendarViewKind, date: string) =>
    calendarViewSchema.parse(
      await client.request(
        "GET",
        `${calendarRoutes.calendarView.replace(":view", view)}?date=${encodeURIComponent(date)}`,
      ),
    ),

  getTimeZone: async () =>
    calendarTimeZoneSchema.parse(await client.request("GET", calendarRoutes.calendarTimeZone)),
});
