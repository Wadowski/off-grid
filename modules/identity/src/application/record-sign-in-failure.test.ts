// SPDX-FileCopyrightText: 2026 Dominik Wadowski
// SPDX-License-Identifier: FSL-1.1-ALv2

import { beforeEach, describe, expect, it } from "vitest";
import { SIGN_IN_FAILURE_LIMIT, SIGN_IN_LOCKOUT_MS } from "../constants.js";
import { signInAttempts } from "../infrastructure/sign-in-attempts.js";
import { clearSignInFailures } from "./clear-sign-in-failures.js";
import { isSignInLocked } from "./is-sign-in-locked.js";
import { recordSignInFailure } from "./record-sign-in-failure.js";

const EMAIL = "anna@example.com";
const NOW = 1_000_000;

const failTimes = (times: number, now: number) => {
  for (let attempt = 0; attempt < times; attempt += 1) {
    recordSignInFailure(EMAIL, now);
  }
};

describe("sign-in lockout", () => {
  beforeEach(() => {
    signInAttempts.clear();
  });

  it("does not lock before the failure limit", () => {
    failTimes(SIGN_IN_FAILURE_LIMIT - 1, NOW);

    expect(isSignInLocked(EMAIL, NOW)).toBe(false);
  });

  it("locks at the failure limit and releases after the lockout period", () => {
    failTimes(SIGN_IN_FAILURE_LIMIT, NOW);

    expect(isSignInLocked(EMAIL, NOW + 1)).toBe(true);
    expect(isSignInLocked(EMAIL, NOW + SIGN_IN_LOCKOUT_MS)).toBe(false);
  });

  it("counts a fresh run of failures after the lockout ends", () => {
    failTimes(SIGN_IN_FAILURE_LIMIT, NOW);
    const afterLockout = NOW + SIGN_IN_LOCKOUT_MS;

    failTimes(SIGN_IN_FAILURE_LIMIT - 1, afterLockout);

    expect(isSignInLocked(EMAIL, afterLockout)).toBe(false);
  });

  it("forgets earlier failures once a sign-in succeeds", () => {
    failTimes(SIGN_IN_FAILURE_LIMIT - 1, NOW);

    clearSignInFailures(EMAIL);
    failTimes(1, NOW);

    expect(isSignInLocked(EMAIL, NOW)).toBe(false);
  });
});
