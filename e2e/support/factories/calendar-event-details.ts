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

const pad = (value: number): string => String(value).padStart(2, "0");

const todayAtUtc = (hour: number, minutes = 60): { startsAt: string; endsAt: string } => {
  // The page's "today" is the browser's local date, so use the same day rather than the UTC date:
  // between 22:00 and 24:00 UTC in a UTC+1 browser the two differ.
  const now = new Date();
  const day = `${now.getFullYear()}-${pad(now.getMonth() + 1)}-${pad(now.getDate())}`;
  const startMinutes = hour * 60;
  const endMinutes = startMinutes + minutes;
  const clock = (total: number) => `${pad(Math.floor(total / 60))}:${pad(total % 60)}`;
  return {
    startsAt: `${day}T${clock(startMinutes)}:00.000Z`,
    endsAt: `${day}T${clock(endMinutes)}:00.000Z`,
  };
};

export async function createCalendarWithColor(
  api: APIRequestContext,
  session: Session,
  input: { name: string; color: string; familyId?: string },
): Promise<string> {
  const response = await eventually(
    async () => {
      const created = await api.post(CALENDARS, {
        headers: bearer(session),
        data: { name: input.name, color: input.color, familyId: input.familyId },
        failOnStatusCode: false,
      });
      if (created.status() === 404) {
        throw new Error(`the family of "${input.name}" is not visible yet`);
      }
      return created;
    },
    { timeout: 15_000, interval: 250 },
  );
  expect(response.status(), `could not create the calendar "${input.name}"`).toBe(201);
  return ((await response.json()) as { id: string }).id;
}

export async function createTodayEvent(
  api: APIRequestContext,
  session: Session,
  calendarId: string,
  title: string,
  slot: { hour: number; minutes?: number } = { hour: 12 },
): Promise<string> {
  const { startsAt, endsAt } = todayAtUtc(slot.hour, slot.minutes);
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
  if (session === undefined) {
    throw new Error(`${displayName} cannot sign in`);
  }
  return {
    account: { email, password: STRONG_PASSWORD, displayName },
    session,
  };
}

export async function joinFamilyAsGuest(
  api: APIRequestContext,
  host: Session,
  familyId: string,
  guest: Session,
): Promise<void> {
  const invitation = await api.post(`/api/families/${familyId}/invitations`, {
    headers: bearer(host),
    failOnStatusCode: false,
  });
  expect(invitation.status(), "the family invitation was not created").toBe(201);
  const { code } = (await invitation.json()) as { code: string };
  const joined = await api.post("/api/families/join", {
    headers: bearer(guest),
    data: { code },
    failOnStatusCode: false,
  });
  expect(joined.status(), "the guest could not join the family").toBeLessThan(300);
}

export async function inviteGuestToEvent(
  api: APIRequestContext,
  session: Session,
  eventId: string,
  guestUserId: string,
): Promise<void> {
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
