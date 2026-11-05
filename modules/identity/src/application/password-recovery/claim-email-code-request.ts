// SPDX-FileCopyrightText: 2026 Dominik Wadowski
// SPDX-License-Identifier: FSL-1.1-ALv2

import { EMAIL_CODE_REQUEST_COOLDOWN_MS } from "../../constants.js";
import { emailCodeRequests } from "../../infrastructure/email-code-requests/email-code-requests.js";

export const claimEmailCodeRequest = (email: string, now: number): boolean => {
  const lastRequestedAt = emailCodeRequests.get(email);
  if (lastRequestedAt !== undefined && now - lastRequestedAt < EMAIL_CODE_REQUEST_COOLDOWN_MS) {
    return false;
  }
  emailCodeRequests.set(email, now);
  return true;
};
