// SPDX-FileCopyrightText: 2026 Dominik Wadowski
// SPDX-License-Identifier: FSL-1.1-ALv2

import type { APIRequestContext, APIResponse } from "@playwright/test";
import { NEW_PASSWORD, signInWith, type Session } from "./instance-admin.js";
import { registerAccount, STRONG_PASSWORD, uniqueEmail } from "./identity.js";
import { eventually } from "../eventually.js";

export type Person = {
  userId: string;
  email: string;
  password: string;
};

export type SignedInPerson = Person & { session: Session; recoveryCode?: string };

export type NotificationItem = {
  id: string;
  type: string;
  readAt: string | null;
};

export type NotificationList = {
  notifications: NotificationItem[];
  unreadCount: number;
};

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

// Regenerating the recovery code is a password-confirmed change that raises a notice,
// so it gives a person an inbox item without changing their password.
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
): Promise<{ status: number; body: NotificationList }> {
  const response = await api.get("/api/me/notifications", {
    headers: bearer(session),
    failOnStatusCode: false,
  });
  return { status: response.status(), body: (await response.json()) as NotificationList };
}

export async function waitForOwnNotifications(
  api: APIRequestContext,
  session: Session,
  ready: (list: NotificationList) => boolean,
): Promise<{ status: number; body: NotificationList }> {
  return eventually(
    async () => {
      const result = await listOwnNotifications(api, session);
      if (!ready(result.body)) {
        throw new Error("the expected notification has not arrived yet");
      }
      return result;
    },
    { timeout: 10_000, interval: 200 },
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
