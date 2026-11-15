// SPDX-FileCopyrightText: 2026 Dominik Wadowski
// SPDX-License-Identifier: FSL-1.1-ALv2

import type {
  CalendarEventUpdateInput,
  CalendarViewKind,
  CreateCalendarRequest,
  NewCalendarEventInput,
  UpdateCalendarRequest,
} from "@offgrid/contracts";
import {
  calendarEventSchema,
  calendarListSchema,
  calendarRoutes,
  calendarSchema,
  calendarTimeZoneSchema,
  calendarViewSchema,
  eventGuestListSchema,
} from "@offgrid/contracts";
import type { ApiClient } from "./types.js";

const withCalendarId = (path: string, id: string): string =>
  path.replace(":id", encodeURIComponent(id));

const withEventGuest = (eventId: string, guestUserId: string): string =>
  calendarRoutes.eventGuest
    .replace(":id", encodeURIComponent(eventId))
    .replace(":guestUserId", encodeURIComponent(guestUserId));

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

  createCalendarEvent: async (calendarId: string, input: NewCalendarEventInput) =>
    calendarEventSchema.parse(
      await client.request(
        "POST",
        withCalendarId(calendarRoutes.calendarEvents, calendarId),
        input,
      ),
    ),

  getCalendarEvent: async (eventId: string) =>
    calendarEventSchema.parse(
      await client.request("GET", withCalendarId(calendarRoutes.calendarEvent, eventId)),
    ),

  updateCalendarEvent: async (eventId: string, input: CalendarEventUpdateInput) =>
    calendarEventSchema.parse(
      await client.request("PATCH", withCalendarId(calendarRoutes.calendarEvent, eventId), input),
    ),

  removeCalendarEvent: async (eventId: string): Promise<void> => {
    await client.request("DELETE", withCalendarId(calendarRoutes.calendarEvent, eventId));
  },

  inviteEventGuest: async (eventId: string, guestUserId: string): Promise<void> => {
    await client.request("POST", withCalendarId(calendarRoutes.eventGuests, eventId), {
      guestUserId,
    });
  },

  listEventGuests: async (eventId: string) =>
    eventGuestListSchema.parse(
      await client.request("GET", withCalendarId(calendarRoutes.eventGuests, eventId)),
    ).guests,

  removeEventGuest: async (eventId: string, guestUserId: string): Promise<void> => {
    await client.request("DELETE", withEventGuest(eventId, guestUserId));
  },

  getTimeZone: async () =>
    calendarTimeZoneSchema.parse(await client.request("GET", calendarRoutes.calendarTimeZone)),
});
