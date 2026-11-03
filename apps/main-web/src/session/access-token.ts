// SPDX-FileCopyrightText: 2026 Dominik Wadowski
// SPDX-License-Identifier: FSL-1.1-ALv2

import { RENEW_BEFORE_EXPIRY_MS } from "../constants.js";

// The access token lives in memory only. It is never written to storage, and the
// refresh token is an HttpOnly cookie the page cannot read (ADR 0016, "Sessions").
let accessToken: string | null = null;
let renewalTimer: ReturnType<typeof setTimeout> | undefined;

export const getAccessToken = (): string | null => accessToken;

export const storeAccessToken = (
  token: string,
  expiresAt: string,
  onRenewalDue: () => void,
): void => {
  accessToken = token;
  clearTimeout(renewalTimer);
  const delay = Math.max(0, Date.parse(expiresAt) - Date.now() - RENEW_BEFORE_EXPIRY_MS);
  renewalTimer = setTimeout(onRenewalDue, delay);
};

export const clearAccessToken = (): void => {
  accessToken = null;
  clearTimeout(renewalTimer);
  renewalTimer = undefined;
};
