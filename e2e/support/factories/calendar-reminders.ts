// SPDX-FileCopyrightText: 2026 Dominik Wadowski
// SPDX-License-Identifier: FSL-1.1-ALv2

import { expect, type APIRequestContext, type APIResponse } from "@playwright/test";
import type { Session } from "./instance-admin.js";
import { changeEvent, eventBodyOf, readEvent } from "./calendar-events.js";

export type CalendarRemindersWorld = {
  starts: Record<string, string>;
  clockFrozen: boolean;
  familyCalendarId?: string;
};

const CLOCK = "/api/e2e/clock";

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
  return changeEvent(api, session, eventId, { reminderOffsetsMinutes: offsets });
}

export function moveEvent(
  api: APIRequestContext,
  session: Session,
  eventId: string,
  window: { startsAt: string; endsAt: string },
): Promise<APIResponse> {
  return changeEvent(api, session, eventId, window);
}

export async function reminderOffsetsSeenBy(
  api: APIRequestContext,
  session: Session,
  eventId: string,
): Promise<number[]> {
  const response = await readEvent(api, session, eventId);
  expect(response.status(), "the event cannot be read").toBe(200);
  return (await eventBodyOf(response)).reminderOffsetsMinutes ?? [];
}
