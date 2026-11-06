// SPDX-FileCopyrightText: 2026 Dominik Wadowski
// SPDX-License-Identifier: FSL-1.1-ALv2

import { afterAll, beforeAll, beforeEach, describe, expect, it } from "vitest";
import {
  startIdentityTestDatabase,
  type IdentityTestDatabase,
} from "../../../test/start-identity-test-database.js";
import { SIGN_IN_ATTEMPT_POLICY, SIGN_IN_LOCKOUT_MS } from "../../constants.js";
import { attemptKey } from "../../infrastructure/attempt-counters/attempt-key.js";
import { clearFailedAttempts } from "./clear-failed-attempts.js";
import { isAttemptLocked } from "./is-attempt-locked.js";
import { recordFailedAttempt } from "./record-failed-attempt.js";

const EMAIL = "anna@example.com";
const NOW = new Date(1_000_000);
const KEY = attemptKey("sign-in", EMAIL);

describe("attempt throttle", { timeout: 60_000 }, () => {
  let db: IdentityTestDatabase;

  beforeAll(async () => {
    db = await startIdentityTestDatabase();
  }, 120_000);

  afterAll(async () => {
    await db.stop();
  });

  beforeEach(async () => {
    await db.reset();
  });

  const failTimes = async (times: number, now: Date): Promise<void> => {
    for (let attempt = 0; attempt < times; attempt += 1) {
      await recordFailedAttempt(db.db, KEY, SIGN_IN_ATTEMPT_POLICY, now);
    }
  };

  it("does not lock before the failure limit", async () => {
    await failTimes(SIGN_IN_ATTEMPT_POLICY.limit - 1, NOW);

    expect(await isAttemptLocked(db.db, KEY, NOW)).toBe(false);
  });

  it("locks at the failure limit and releases after the lockout period", async () => {
    await failTimes(SIGN_IN_ATTEMPT_POLICY.limit, NOW);

    expect(await isAttemptLocked(db.db, KEY, new Date(NOW.getTime() + 1))).toBe(true);
    expect(await isAttemptLocked(db.db, KEY, new Date(NOW.getTime() + SIGN_IN_LOCKOUT_MS))).toBe(
      false,
    );
  });

  it("counts a fresh run of failures after the lockout ends", async () => {
    await failTimes(SIGN_IN_ATTEMPT_POLICY.limit, NOW);
    const afterLockout = new Date(NOW.getTime() + SIGN_IN_LOCKOUT_MS);

    await failTimes(SIGN_IN_ATTEMPT_POLICY.limit - 1, afterLockout);

    expect(await isAttemptLocked(db.db, KEY, afterLockout)).toBe(false);
  });

  it("forgets earlier failures once cleared", async () => {
    await failTimes(SIGN_IN_ATTEMPT_POLICY.limit - 1, NOW);

    await clearFailedAttempts(db.db, KEY);
    await failTimes(1, NOW);

    expect(await isAttemptLocked(db.db, KEY, NOW)).toBe(false);
  });
});
