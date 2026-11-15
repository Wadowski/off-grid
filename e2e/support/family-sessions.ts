// SPDX-FileCopyrightText: 2026 Dominik Wadowski
// SPDX-License-Identifier: FSL-1.1-ALv2

import { expect, type APIRequestContext } from "@playwright/test";
import { registerAccount, STRONG_PASSWORD, uniqueEmail } from "./factories/identity.js";
import { signInWith, type Session } from "./factories/instance-admin.js";
import type { ScenarioWorld } from "./fixtures.js";
import type { WebAccount } from "./web-session.js";

export const bearer = (session: Session): Record<string, string> => ({
  authorization: `Bearer ${session.accessToken}`,
});

export const sessionOf = async (api: APIRequestContext, displayName: string): Promise<Session> =>
  (await accountSessionOf(api, displayName)).session;

export const accountSessionOf = async (
  api: APIRequestContext,
  displayName: string,
): Promise<{ account: WebAccount; session: Session }> => {
  const email = uniqueEmail(displayName.toLowerCase().replace(/\s+/g, "-"));
  const registration = await registerAccount(api, { email, displayName });
  expect(registration.status).toBe(201);
  const { session } = await signInWith(api, email, STRONG_PASSWORD);
  expect(session, `${displayName} cannot sign in`).toBeDefined();
  return {
    account: { email, password: STRONG_PASSWORD, displayName },
    session: session as Session,
  };
};

export const memberSessionOf = (world: ScenarioWorld): Session => {
  if (world.memberAccessToken === undefined || world.userId === undefined) {
    throw new Error("No signed-in member is set up for this scenario.");
  }
  return { userId: world.userId, accessToken: world.memberAccessToken };
};

export const joinFamilyWithInvitation = async (
  api: APIRequestContext,
  admin: Session,
  joiner: Session,
  familyId: string,
): Promise<void> => {
  const invitation = await api.post(`/api/families/${familyId}/invitations`, {
    headers: bearer(admin),
    failOnStatusCode: false,
  });
  expect(invitation.status(), "the invitation was not created").toBe(201);
  const { code } = (await invitation.json()) as { code: string };
  const joined = await api.post("/api/families/join", {
    headers: bearer(joiner),
    data: { code },
    failOnStatusCode: false,
  });
  expect(joined.status(), "the invitation was not accepted").toBe(201);
};
