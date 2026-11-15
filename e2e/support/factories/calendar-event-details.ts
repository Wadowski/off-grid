// SPDX-FileCopyrightText: 2026 Dominik Wadowski
// SPDX-License-Identifier: FSL-1.1-ALv2

import { expect, type APIRequestContext } from "@playwright/test";
import { bearer } from "../family-sessions.js";
import { eventually } from "../eventually.js";
import { registerAccount, STRONG_PASSWORD, uniqueEmail } from "./identity.js";
import { signInWith, type Session } from "./instance-admin.js";
import type { WebAccount } from "../web-session.js";

export type EventDetailsWorld = {
  eventIds: Record<string, string>;
  guest?: { account: WebAccount; session: Session };
};

const CALENDARS = "/api/calendars";
const EVENTS = "/api/events";

// Noon UTC on the current UTC day keeps the event on today's agenda in any zone within twelve hours.
export const todayAtUtc = (hour: number): { startsAt: string; endsAt: string } => {
  const day = new Date().toISOString().slice(0, 10);
  const pad = (value: number) => String(value).padStart(2, "0");
  return {
    startsAt: `${day}T${pad(hour)}:00:00.000Z`,
    endsAt: `${day}T${pad(hour + 1)}:00:00.000Z`,
  };
};

export async function createCalendarWithColor(
  api: APIRequestContext,
  session: Session,
  input: { name: string; color: string; familyId?: string },
): Promise<string> {
  const response = await api.post(CALENDARS, {
    headers: bearer(session),
    data: { name: input.name, color: input.color, familyId: input.familyId },
    failOnStatusCode: false,
  });
  expect(response.status(), `could not create the calendar "${input.name}"`).toBe(201);
  return ((await response.json()) as { id: string }).id;
}

export async function createTodayEvent(
  api: APIRequestContext,
  session: Session,
  calendarId: string,
  title: string,
): Promise<string> {
  const { startsAt, endsAt } = todayAtUtc(12);
  const response = await api.post(`${CALENDARS}/${calendarId}/events`, {
    headers: bearer(session),
    data: { title, isAllDay: false, startsAt, endsAt },
    failOnStatusCode: false,
  });
  expect(response.status(), `could not create the event "${title}"`).toBe(201);
  return ((await response.json()) as { id: string }).id;
}

export async function createGuestAccount(
  api: APIRequestContext,
  displayName: string,
): Promise<{ account: WebAccount; session: Session }> {
  const email = uniqueEmail(displayName.toLowerCase());
  const registration = await registerAccount(api, { email, displayName });
  expect(registration.status, `could not create ${displayName}`).toBe(201);
  const { session } = await signInWith(api, email, STRONG_PASSWORD);
  expect(session, `${displayName} cannot sign in`).toBeDefined();
  return {
    account: { email, password: STRONG_PASSWORD, displayName },
    session: session as Session,
  };
}

export async function inviteGuestToEvent(
  api: APIRequestContext,
  session: Session,
  eventId: string,
  guestUserId: string,
): Promise<void> {
  // The guest must share a family with the host as the calendar projection sees it, which
  // catches up asynchronously after the family join, so the invite is retried until it is accepted.
  await eventually(
    async () => {
      const response = await api.post(`${EVENTS}/${eventId}/guests`, {
        headers: bearer(session),
        data: { guestUserId },
        failOnStatusCode: false,
      });
      expect([200, 201], "could not invite the guest").toContain(response.status());
    },
    { timeout: 15_000, interval: 250 },
  );
}
