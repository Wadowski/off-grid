// SPDX-FileCopyrightText: 2026 Dominik Wadowski
// SPDX-License-Identifier: FSL-1.1-ALv2

import { expect, type APIRequestContext, type APIResponse } from "@playwright/test";
import { ApiError } from "@offgrid/api-client";
import { test as base } from "playwright-bdd";
import { targetBaseUrl } from "./stack.js";
import { captureScreen, isScreenUrl, screenNameFor, screenshotsEnabled } from "./screenshots.js";
import { scenarioClientAddress } from "./scenario-client-address.js";
import type { Family } from "./factories/family.js";
import type { RegistrationResult } from "./factories/identity.js";
import type { JsonResponse, Member, Session } from "./factories/instance-admin.js";
import type { SignedInPerson } from "./factories/notifications.js";
import type { CalendarEventsWorld } from "./factories/calendar-events.js";
import type { CalendarViewsWorld } from "./factories/calendar-views.js";
import type { EventDetailsWorld } from "./factories/calendar-event-details.js";

export type ScenarioWorld = {
  api: APIRequestContext;
  healthResponse?: APIResponse;
  versionResponse?: APIResponse;
  families: Family[];
  calendarIds?: Record<string, string>;
  accessibilityViolations?: string[];
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
  joinerSession?: Session;
  familyOwner?: Session;
  inviterDisplayName?: string;
  otherPeople?: Record<string, Session>;
  lastOtherPerson?: string;
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
  calendarEvents?: CalendarEventsWorld;
  calendarViews?: CalendarViewsWorld;
  eventDetails?: EventDetailsWorld;
  releaseBuild?: { version: string; serverDigest?: string; webDigest?: string };
  releaseManifestRun?: { exitCode: number; stderr: string; outPath: string };
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
      if (screenshotsEnabled() && $tags.includes("@ui") && isScreenUrl(page.url())) {
        const feature = $test.info().titlePath.at(-2) ?? "feature";
        const screen = screenNameFor(page.url(), $tags);
        await captureScreen(page, screen, feature).catch(() => undefined);
      }
    },
    { auto: true },
  ],
});

export { expect };
