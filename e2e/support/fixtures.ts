// SPDX-FileCopyrightText: 2026 Dominik Wadowski
// SPDX-License-Identifier: FSL-1.1-ALv2

import { expect, type APIRequestContext, type APIResponse } from "@playwright/test";
import { ApiError } from "@offgrid/api-client";
import { test as base } from "playwright-bdd";
import { targetBaseUrl } from "./stack.js";
import { scenarioClientAddress } from "./scenario-client-address.js";
import type { Family } from "./factories/family.js";
import type { RegistrationResult } from "./factories/identity.js";
import type { JsonResponse, Member, Session } from "./factories/instance-admin.js";

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
  registrationTouched?: boolean;
};

export const test = base.extend<{ world: ScenarioWorld }>({
  world: async ({ playwright }, use) => {
    const api = await playwright.request.newContext({
      baseURL: targetBaseUrl(),
      extraHTTPHeaders: { "x-forwarded-for": scenarioClientAddress() },
    });
    await use({ api, families: [] });
    await api.dispose();
  },
});

export { expect };
