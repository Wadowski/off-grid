// SPDX-FileCopyrightText: 2026 Dominik Wadowski
// SPDX-License-Identifier: FSL-1.1-ALv2

import { anonymousAuthClient } from "../api/anonymous-api-client.js";
import { storeAccessToken } from "./access-token.js";
import { endSessionLocally } from "./end-session.js";

type AccessGrant = { readonly accessToken: string; readonly accessExpiresAt: string };

// Stores a new access token and schedules its renewal before it expires.
export const adoptAccessToken = (grant: AccessGrant): void => {
  storeAccessToken(grant.accessToken, grant.accessExpiresAt, renewalIsDue);
};

const renewalIsDue = (): void => {
  renewSession().catch(() => endSessionLocally("sessionEnded"));
};

let inFlight: Promise<void> | null = null;

// Renews the access token from the refresh cookie. Callers that arrive while a
// renewal is running share its result, so two requests never rotate the token twice.
// A rejected renewal is left to the caller to end the session.
export const renewSession = (): Promise<void> => {
  inFlight ??= anonymousAuthClient
    .refresh()
    .then(adoptAccessToken)
    .finally(() => {
      inFlight = null;
    });
  return inFlight;
};
