// SPDX-FileCopyrightText: 2026 Dominik Wadowski
// SPDX-License-Identifier: FSL-1.1-ALv2

import { expect, type APIRequestContext, type APIResponse } from "@playwright/test";
import { bearer } from "../family-sessions.js";
import type { Session } from "./instance-admin.js";

export type CalendarRecord = {
  name: string;
  id: string;
  owner?: string;
  familyName?: string;
};

export type EventRecord = {
  id: string;
  title: string;
  creator: string;
};

export type CalendarEventsWorld = {
  people: Record<string, Session>;
  actor?: string;
  families: Record<string, { id: string }>;
  members: Record<string, string[]>;
  calendars: CalendarRecord[];
  events: EventRecord[];
};

export type EventBody = {
  id: string;
  calendarId: string;
  title: string;
  startsAt: string;
  endsAt: string;
};

export const CALENDAR_COLOR = "blue";

const CALENDARS = "/api/calendars";
const EVENTS = "/api/events";

export async function createCalendarNamed(
  api: APIRequestContext,
  session: Session,
  input: { name: string; familyId?: string },
): Promise<{ id: string }> {
  const response = await api.post(CALENDARS, {
    headers: bearer(session),
    data: { name: input.name, color: CALENDAR_COLOR, familyId: input.familyId },
    failOnStatusCode: false,
  });
  expect(response.status(), `could not create the calendar "${input.name}"`).toBe(201);
  return (await response.json()) as { id: string };
}

export function setTimeZoneFor(
  api: APIRequestContext,
  session: Session,
  timeZone: string,
): Promise<APIResponse> {
  return api.put("/api/calendar/time-zone", {
    headers: bearer(session),
    data: { timeZone },
    failOnStatusCode: false,
  });
}

export function createTimedEvent(
  api: APIRequestContext,
  session: Session,
  calendarId: string,
  input: { title: string; startsAt: string; endsAt: string },
): Promise<APIResponse> {
  return api.post(`${CALENDARS}/${calendarId}/events`, {
    headers: bearer(session),
    data: { title: input.title, isAllDay: false, startsAt: input.startsAt, endsAt: input.endsAt },
    failOnStatusCode: false,
  });
}

export function createAllDayEvent(
  api: APIRequestContext,
  session: Session,
  calendarId: string,
  input: { title: string; startDate: string; endDate: string },
): Promise<APIResponse> {
  return api.post(`${CALENDARS}/${calendarId}/events`, {
    headers: bearer(session),
    data: {
      title: input.title,
      isAllDay: true,
      startDate: input.startDate,
      endDate: input.endDate,
    },
    failOnStatusCode: false,
  });
}

export function listEventsOf(
  api: APIRequestContext,
  session: Session,
  calendarId: string,
): Promise<APIResponse> {
  return api.get(`${CALENDARS}/${calendarId}/events`, {
    headers: bearer(session),
    failOnStatusCode: false,
  });
}

export function readEvent(
  api: APIRequestContext,
  session: Session,
  eventId: string,
): Promise<APIResponse> {
  return api.get(`${EVENTS}/${eventId}`, { headers: bearer(session), failOnStatusCode: false });
}

export function changeEvent(
  api: APIRequestContext,
  session: Session,
  eventId: string,
  change: Record<string, string>,
): Promise<APIResponse> {
  return api.patch(`${EVENTS}/${eventId}`, {
    headers: bearer(session),
    data: change,
    failOnStatusCode: false,
  });
}

export function deleteEvent(
  api: APIRequestContext,
  session: Session,
  eventId: string,
): Promise<APIResponse> {
  return api.delete(`${EVENTS}/${eventId}`, {
    headers: bearer(session),
    failOnStatusCode: false,
  });
}

export async function eventBodyOf(response: APIResponse): Promise<EventBody> {
  return (await response.json()) as EventBody;
}
