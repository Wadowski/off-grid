// SPDX-FileCopyrightText: 2026 Dominik Wadowski
// SPDX-License-Identifier: FSL-1.1-ALv2

import { expect, type APIRequestContext, type APIResponse } from "@playwright/test";
import { ApiError } from "@offgrid/api-client";
import { test as base } from "playwright-bdd";
import { targetBaseUrl } from "./stack.js";
import { captureScreen, screenshotsEnabled } from "./screenshots.js";
import { scenarioClientAddress } from "./scenario-client-address.js";
import type { Family } from "./factories/family.js";
import type { RegistrationResult } from "./factories/identity.js";
import type { JsonResponse, Member, Session } from "./factories/instance-admin.js";
import type { SignedInPerson } from "./factories/notifications.js";

export type ScenarioWorld = {
  api: APIRequestContext;
  healthResponse?: APIResponse;
  families: Family[];
  userId?: string;
  lastError?: ApiError;
  registration?: RegistrationResult;
  registrationStatus?: unknown;
  emailTag?: string;
  admin?: Session;
  memberAccessToken?: string;
  member?: Member;
  response?: JsonResponse;
  issuedCode?: string;
  invitationCode?: string;
  invitationId?: string;
  invitationFamilyId?: string;
  joinerSession?: { userId: string; accessToken: string };
  registrationTouched?: boolean;
  adminPasswordChanged?: boolean;
  people?: Record<string, SignedInPerson>;
  notificationId?: string;
  newAccountEmail?: string;
  signInEmail?: string;
  signInFailure?: JsonResponse;
  unknownEmailFailure?: JsonResponse;
  refreshCookie?: string;
  rememberMeCookie?: string;
  recoveryAccount?: {
    email: string;
    password: string;
    recoveryCode?: string;
    newRecoveryCode?: string;
  };
  ownAccount?: {
    email: string;
    password: string;
    displayName: string;
    phoneAccessToken?: string;
  };
};

export const test = base.extend<{ world: ScenarioWorld; screenOfUiScenario: void }>({
  world: async ({ playwright }, use) => {
    const api = await playwright.request.newContext({
      baseURL: targetBaseUrl(),
      extraHTTPHeaders: { "x-forwarded-for": scenarioClientAddress() },
    });
    await use({ api, families: [] });
    await api.dispose();
  },
  screenOfUiScenario: [
    async ({ page, $tags, $test }, use) => {
      await use();
      if (screenshotsEnabled() && $tags.includes("@ui")) {
        const feature = $test.info().titlePath.at(-2) ?? "feature";
        await captureScreen(page, $test.info().title, feature).catch(() => undefined);
      }
    },
    { auto: true },
  ],
});

export { expect };
