// SPDX-FileCopyrightText: 2026 Dominik Wadowski
// SPDX-License-Identifier: FSL-1.1-ALv2

import { SIGN_IN_FAILURE_LIMIT, SIGN_IN_LOCKOUT_MS } from "../../constants.js";
import { signInAttempts } from "../../infrastructure/sign-in-attempts/sign-in-attempts.js";

export const recordSignInFailure = (email: string, now: number): void => {
  const failures = (signInAttempts.get(email)?.failures ?? 0) + 1;
  const lockedUntil = failures >= SIGN_IN_FAILURE_LIMIT ? now + SIGN_IN_LOCKOUT_MS : 0;
  signInAttempts.set(email, { failures: lockedUntil > 0 ? 0 : failures, lockedUntil });
};
