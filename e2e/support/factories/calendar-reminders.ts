// SPDX-FileCopyrightText: 2026 Dominik Wadowski
// SPDX-License-Identifier: FSL-1.1-ALv2

import { expect, type APIRequestContext, type APIResponse } from "@playwright/test";
import { bearer } from "../family-sessions.js";
import type { Session } from "./instance-admin.js";

export type CalendarRemindersWorld = {
  starts: Record<string, string>;
  clockFrozen: boolean;
  familyCalendarId?: string;
};

const CLOCK = "/api/e2e/clock";
const EVENTS = "/api/events";

// Time seam only: freezes the clock the reminder worker reads (OFFGRID_E2E_CLOCK on the e2e
// stack). It writes no rows, so scenarios still set up their data through the public API.
export async function freezeClockAt(api: APIRequestContext, instant: string): Promise<void> {
  const response = await api.put(CLOCK, { data: { now: instant }, failOnStatusCode: false });
  expect(response.status(), `the clock could not be set to ${instant}`).toBe(204);
}

export async function releaseClock(api: APIRequestContext): Promise<void> {
  const response = await api.delete(CLOCK, { failOnStatusCode: false });
  expect(response.status(), "the clock could not be released").toBe(204);
}

export function setReminderOffsets(
  api: APIRequestContext,
  session: Session,
  eventId: string,
  offsets: readonly number[],
): Promise<APIResponse> {
  return api.patch(`${EVENTS}/${eventId}`, {
    headers: bearer(session),
    data: { reminderOffsetsMinutes: offsets },
    failOnStatusCode: false,
  });
}

export function moveEvent(
  api: APIRequestContext,
  session: Session,
  eventId: string,
  window: { startsAt: string; endsAt: string },
): Promise<APIResponse> {
  return api.patch(`${EVENTS}/${eventId}`, {
    headers: bearer(session),
    data: window,
    failOnStatusCode: false,
  });
}

// Reads the offsets that the requesting person set. Another person sees none of them.
export async function reminderOffsetsSeenBy(
  api: APIRequestContext,
  session: Session,
  eventId: string,
): Promise<number[]> {
  const response = await api.get(`${EVENTS}/${eventId}`, {
    headers: bearer(session),
    failOnStatusCode: false,
  });
  expect(response.status(), "the event cannot be read").toBe(200);
  const body = (await response.json()) as { reminderOffsetsMinutes?: number[] };
  return body.reminderOffsetsMinutes ?? [];
}

export async function defaultCalendarIdOf(
  api: APIRequestContext,
  session: Session,
): Promise<string | undefined> {
  const response = await api.get("/api/calendars", {
    headers: bearer(session),
    failOnStatusCode: false,
  });
  expect(response.status()).toBe(200);
  const body = (await response.json()) as { calendars: { id: string; isDefault: boolean }[] };
  return body.calendars.find((calendar) => calendar.isDefault)?.id;
}
