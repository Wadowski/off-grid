// SPDX-FileCopyrightText: 2026 Dominik Wadowski
// SPDX-License-Identifier: FSL-1.1-ALv2

import { expect, type APIRequestContext } from "@playwright/test";
import { registerAccount, STRONG_PASSWORD, uniqueEmail } from "./factories/identity.js";
import { signInWith, type Session } from "./factories/instance-admin.js";
import type { ScenarioWorld } from "./fixtures.js";

export const bearer = (session: Session): Record<string, string> => ({
  authorization: `Bearer ${session.accessToken}`,
});

export const sessionOf = async (api: APIRequestContext, displayName: string): Promise<Session> => {
  const email = uniqueEmail(displayName.toLowerCase().replace(/\s+/g, "-"));
  const registration = await registerAccount(api, { email, displayName });
  expect(registration.status).toBe(201);
  const { session } = await signInWith(api, email, STRONG_PASSWORD);
  expect(session, `${displayName} cannot sign in`).toBeDefined();
  return session as Session;
};

export const memberSessionOf = (world: ScenarioWorld): Session => {
  if (world.memberAccessToken === undefined || world.userId === undefined) {
    throw new Error("No signed-in member is set up for this scenario.");
  }
  return { userId: world.userId, accessToken: world.memberAccessToken };
};
