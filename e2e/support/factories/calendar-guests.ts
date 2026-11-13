// SPDX-FileCopyrightText: 2026 Dominik Wadowski
// SPDX-License-Identifier: FSL-1.1-ALv2

import type { APIRequestContext, APIResponse } from "@playwright/test";
import { bearer } from "../family-sessions.js";
import type { Session } from "./instance-admin.js";
import { CALENDAR_COLOR } from "./calendar-events.js";

export type GuestEventBody = {
  id: string;
  calendarId: string;
  title: string;
  startsAt: string;
  endsAt: string;
  location: string | null;
  calendarName?: string;
  readOnly: boolean;
};

const CALENDARS = "/api/calendars";
const EVENTS = "/api/events";

export function createCalendarForFamily(
  api: APIRequestContext,
  session: Session,
  input: { name: string; familyId: string },
): Promise<APIResponse> {
  return api.post(CALENDARS, {
    headers: bearer(session),
    data: { name: input.name, color: CALENDAR_COLOR, familyId: input.familyId },
    failOnStatusCode: false,
  });
}

export function createEventWithLocation(
  api: APIRequestContext,
  session: Session,
  calendarId: string,
  input: { title: string; startsAt: string; endsAt: string; location?: string },
): Promise<APIResponse> {
  return api.post(`${CALENDARS}/${calendarId}/events`, {
    headers: bearer(session),
    data: {
      title: input.title,
      isAllDay: false,
      startsAt: input.startsAt,
      endsAt: input.endsAt,
      location: input.location,
    },
    failOnStatusCode: false,
  });
}

export function inviteGuest(
  api: APIRequestContext,
  session: Session,
  eventId: string,
  guestUserId: string,
): Promise<APIResponse> {
  return api.post(`${EVENTS}/${eventId}/guests`, {
    headers: bearer(session),
    data: { guestUserId },
    failOnStatusCode: false,
  });
}
