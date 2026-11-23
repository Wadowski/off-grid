// SPDX-FileCopyrightText: 2026 Dominik Wadowski
// SPDX-License-Identifier: FSL-1.1-ALv2

import { calendarEventSchema } from "@offgrid/contracts";
import { expect, type APIRequestContext, type APIResponse } from "@playwright/test";
import { NEW_PASSWORD, signInWith, type Session } from "./instance-admin.js";
import { registerAccount, STRONG_PASSWORD, uniqueEmail } from "./identity.js";
import { changeEvent, createTimedEvent } from "./calendar-events.js";
import { createEventWithLocation, inviteGuest } from "./calendar-guests.js";
import { eventually } from "../eventually.js";
import type { NoticeType } from "./types.js";

export type Person = {
  userId: string;
  email: string;
  password: string;
};

export type SignedInPerson = Person & { session: Session; recoveryCode?: string };

export type NotificationItem = {
  id: string;
  type: string;
  category: string;
  readAt: string | null;
};

export type NotificationList = {
  notifications: NotificationItem[];
  unreadCount: number;
  total: number;
};

const INVITED_EVENT_STARTS_AT = "2026-12-01T09:00:00Z";
const INVITED_EVENT_ENDS_AT = "2026-12-01T09:30:00Z";
const ONE_HOUR_MS = 60 * 60 * 1000;
const NOTICE_WAIT_TIMEOUT_MS = 10_000;
const REMINDER_NOTICE_WAIT_TIMEOUT_MS = 45_000;

export async function signedInPerson(
  api: APIRequestContext,
  name: string,
): Promise<SignedInPerson> {
  const email = uniqueEmail(name.toLowerCase());
  const registration = await registerAccount(api, { email, displayName: name });
  if (registration.status !== 201) {
    throw new Error(`Could not create ${name}: ${JSON.stringify(registration.body)}`);
  }
  const { session } = await signInWith(api, email, STRONG_PASSWORD);
  if (session === undefined) {
    throw new Error(`${name} cannot sign in after registering`);
  }
  const body = registration.body as { user: { id: string } };
  const recoveryCode = (registration.body as { recoveryCode?: string }).recoveryCode;
  return { userId: body.user.id, email, password: STRONG_PASSWORD, session, recoveryCode };
}

function bearer(session: Session): Record<string, string> {
  return { authorization: `Bearer ${session.accessToken}` };
}

export function changeOwnPassword(
  api: APIRequestContext,
  person: SignedInPerson,
): Promise<APIResponse> {
  return api.post("/api/me/password", {
    headers: bearer(person.session),
    data: { currentPassword: person.password, newPassword: NEW_PASSWORD },
    failOnStatusCode: false,
  });
}

export function regenerateOwnRecoveryCode(
  api: APIRequestContext,
  person: SignedInPerson,
): Promise<APIResponse> {
  return api.post("/api/me/recovery-code", {
    headers: bearer(person.session),
    data: { password: person.password },
    failOnStatusCode: false,
  });
}

export async function listOwnNotifications(
  api: APIRequestContext,
  session: Session,
  query: { category?: string; unread?: "true" } = {},
): Promise<{ status: number; body: NotificationList }> {
  const response = await api.get("/api/me/notifications", {
    params: query,
    headers: bearer(session),
    failOnStatusCode: false,
  });
  return { status: response.status(), body: (await response.json()) as NotificationList };
}

export async function waitForOwnNotifications(
  api: APIRequestContext,
  session: Session,
  ready: (list: NotificationList) => boolean,
  timeout = NOTICE_WAIT_TIMEOUT_MS,
): Promise<{ status: number; body: NotificationList }> {
  return eventually(
    async () => {
      const result = await listOwnNotifications(api, session);
      if (!ready(result.body)) {
        throw new Error("the expected notification has not arrived yet");
      }
      return result;
    },
    { timeout, interval: 200 },
  );
}

export function markOwnNotificationRead(
  api: APIRequestContext,
  session: Session,
  notificationId: string,
): Promise<APIResponse> {
  return api.post(`/api/me/notifications/${notificationId}/read`, {
    headers: bearer(session),
    failOnStatusCode: false,
  });
}

export const markAllOwnNotificationsRead = (
  api: APIRequestContext,
  session: Session,
): Promise<APIResponse> =>
  api.post("/api/me/notifications/read-all", {
    headers: bearer(session),
    failOnStatusCode: false,
  });

const countNoticesOfType = (list: NotificationList, type: NoticeType): number =>
  list.notifications.filter((notification) => notification.type === type).length;

const noticeCountOf = async (
  api: APIRequestContext,
  session: Session,
  type: NoticeType,
): Promise<number> => {
  const { body } = await listOwnNotifications(api, session);
  return countNoticesOfType(body, type);
};

const createNoticeAndWait = async (
  api: APIRequestContext,
  person: SignedInPerson,
  type: NoticeType,
  create: () => Promise<void>,
  timeout = NOTICE_WAIT_TIMEOUT_MS,
): Promise<void> => {
  const before = await noticeCountOf(api, person.session, type);
  await create();
  await waitForOwnNotifications(
    api,
    person.session,
    (list) => countNoticesOfType(list, type) > before,
    timeout,
  );
};

const inviteGuestWhenSettled = async (
  api: APIRequestContext,
  host: SignedInPerson,
  eventId: string,
  guestUserId: string,
): Promise<APIResponse> => {
  const SETTLE_TIMEOUT_MS = 5_000;
  const SETTLE_INTERVAL_MS = 200;
  const deadline = Date.now() + SETTLE_TIMEOUT_MS;
  let response = await inviteGuest(api, host.session, eventId, guestUserId);
  while (response.status() === 400 && Date.now() < deadline) {
    await new Promise((resolve) => setTimeout(resolve, SETTLE_INTERVAL_MS));
    response = await inviteGuest(api, host.session, eventId, guestUserId);
  }
  return response;
};

export const createPasswordChangeNotice = async (
  api: APIRequestContext,
  person: SignedInPerson,
): Promise<void> => {
  await createNoticeAndWait(api, person, "password-changed", async () => {
    const response = await changeOwnPassword(api, person);
    expect(response.ok(), `${person.email} could not change the password`).toBe(true);
    person.password = NEW_PASSWORD;
  });
};

export const createRecoveryCodeNotice = async (
  api: APIRequestContext,
  person: SignedInPerson,
): Promise<void> => {
  await createNoticeAndWait(api, person, "recovery-code-regenerated", async () => {
    const response = await regenerateOwnRecoveryCode(api, person);
    expect(response.status(), `${person.email} could not get a new recovery code`).toBe(201);
  });
};

export const createEventInvitation = async (
  api: APIRequestContext,
  host: SignedInPerson,
  guest: SignedInPerson,
  input: { calendarId: string; title: string },
): Promise<void> => {
  const created = await createEventWithLocation(api, host.session, input.calendarId, {
    title: input.title,
    startsAt: INVITED_EVENT_STARTS_AT,
    endsAt: INVITED_EVENT_ENDS_AT,
  });
  expect(created.status(), `${host.email} could not create "${input.title}"`).toBe(201);
  const { id: eventId } = calendarEventSchema.pick({ id: true }).parse(await created.json());
  const invited = await inviteGuestWhenSettled(api, host, eventId, guest.userId);
  expect(invited.status(), `${host.email} could not invite ${guest.email}`).toBe(201);
};

export const createEventReminderNotice = async (
  api: APIRequestContext,
  person: SignedInPerson,
  input: { calendarId: string; title: string },
): Promise<void> => {
  await createNoticeAndWait(
    api,
    person,
    "event-reminder",
    async () => {
      const startsAt = new Date();
      const endsAt = new Date(startsAt.getTime() + ONE_HOUR_MS);
      const created = await createTimedEvent(api, person.session, input.calendarId, {
        title: input.title,
        startsAt: startsAt.toISOString(),
        endsAt: endsAt.toISOString(),
      });
      expect(created.status(), `could not create "${input.title}"`).toBe(201);
      const { id: eventId } = calendarEventSchema.pick({ id: true }).parse(await created.json());
      const reminded = await changeEvent(api, person.session, eventId, {
        reminderOffsetsMinutes: [0],
      });
      expect(reminded.status(), `could not set the reminder of "${input.title}"`).toBe(200);
    },
    REMINDER_NOTICE_WAIT_TIMEOUT_MS,
  );
};
