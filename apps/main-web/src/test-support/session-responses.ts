// SPDX-FileCopyrightText: 2026 Dominik Wadowski
// SPDX-License-Identifier: FSL-1.1-ALv2

import type { FakeResponse } from "../pages/families-page/types.js";
import type { FamilySummary } from "../types.js";

export const SIGNED_IN_USER_ID = "9f1c2a4e-8d3b-4c6a-9e2f-1a2b3c4d5e6f";

const fifteenMinutesFromNow = (): string => new Date(Date.now() + 15 * 60_000).toISOString();

export const accessGrantResponse = (): FakeResponse => ({
  status: 200,
  body: { accessToken: "test-access-token", accessExpiresAt: fifteenMinutesFromNow() },
});

export const profileResponse = (families: readonly FamilySummary[] = []): FakeResponse => ({
  status: 200,
  body: {
    id: SIGNED_IN_USER_ID,
    email: "anna@example.com",
    displayName: "Anna Kowalska",
    instanceRole: "user",
    families,
  },
});

// The two requests that bring a person into a signed-in session on startup.
export const signedInStartup = (families: readonly FamilySummary[] = []): FakeResponse[] => [
  accessGrantResponse(),
  profileResponse(families),
];

export const sessionEndedResponse = (): FakeResponse => ({
  status: 401,
  body: { code: "SESSION_ENDED", message: "Please sign in again" },
});

export const freshServerResponse = (): FakeResponse => ({
  status: 200,
  body: { freshServer: true, registrationOpen: true },
});
