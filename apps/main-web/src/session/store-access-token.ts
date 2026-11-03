// SPDX-FileCopyrightText: 2026 Dominik Wadowski
// SPDX-License-Identifier: FSL-1.1-ALv2

import { RENEW_BEFORE_EXPIRY_MS } from "../constants.js";
import { accessTokenState } from "./access-token-state.js";

export const storeAccessToken = (
  token: string,
  expiresAt: string,
  onRenewalDue: () => void,
): void => {
  accessTokenState.token = token;
  clearTimeout(accessTokenState.renewalTimer);
  const delay = Math.max(0, Date.parse(expiresAt) - Date.now() - RENEW_BEFORE_EXPIRY_MS);
  accessTokenState.renewalTimer = setTimeout(onRenewalDue, delay);
};
