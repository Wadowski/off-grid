// SPDX-FileCopyrightText: 2026 Dominik Wadowski
// SPDX-License-Identifier: FSL-1.1-ALv2

import { RENEW_BEFORE_EXPIRY_MS } from "../constants.js";
import { sessionRuntime } from "./session-runtime.js";

export const storeAccessToken = (
  token: string,
  expiresAt: string,
  onRenewalDue: () => void,
): void => {
  sessionRuntime.accessToken = token;
  clearTimeout(sessionRuntime.renewalTimer);
  const delay = Math.max(0, Date.parse(expiresAt) - Date.now() - RENEW_BEFORE_EXPIRY_MS);
  sessionRuntime.renewalTimer = setTimeout(onRenewalDue, delay);
};
