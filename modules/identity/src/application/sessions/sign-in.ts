// SPDX-FileCopyrightText: 2026 Dominik Wadowski
// SPDX-License-Identifier: FSL-1.1-ALv2

import type { ModuleDatabase } from "@offgrid/db";
import {
  REMEMBER_ME_SESSION_LIFETIME_MS,
  SESSION_LIFETIME_MS,
  SIGN_IN_ATTEMPT_POLICY,
} from "../../constants.js";
import { normalizeEmail } from "../../domain/email/normalize-email.js";
import { normalizePassword } from "../../domain/password/normalize-password.js";
import { dummyPasswordHash } from "../../infrastructure/credentials/dummy-password-hash.js";
import { findAccountForSignIn } from "../../infrastructure/accounts/find-account-for-sign-in.js";
import { attemptKey } from "../../infrastructure/attempt-counters/attempt-key.js";
import { verifyPassword } from "../../infrastructure/credentials/verify-password.js";
import type { SignedInSession, SignInInput } from "../../types.js";
import { clearFailedAttempts } from "../attempt-throttle/clear-failed-attempts.js";
import { isAttemptLocked } from "../attempt-throttle/is-attempt-locked.js";
import { recordFailedAttempt } from "../attempt-throttle/record-failed-attempt.js";
import { InvalidCredentialsError } from "../errors/invalid-credentials-error.js";
import { issueSession } from "./issue-session.js";

export const signIn = async (
  db: ModuleDatabase,
  input: SignInInput,
  now: number = Date.now(),
): Promise<SignedInSession> => {
  const email = normalizeEmail(input.email);
  const key = attemptKey("sign-in", email);
  const at = new Date(now);
  if (await isAttemptLocked(db, key, at)) {
    throw new InvalidCredentialsError();
  }
  const account = await findAccountForSignIn(db, email);
  const passwordHash = account?.passwordHash ?? (await dummyPasswordHash());
  const passwordMatches = await verifyPassword(passwordHash, normalizePassword(input.password));
  if (account === null || !passwordMatches || account.status !== "active") {
    await recordFailedAttempt(db, key, SIGN_IN_ATTEMPT_POLICY, at);
    throw new InvalidCredentialsError();
  }
  await clearFailedAttempts(db, key);
  const session = await issueSession(db, account.userId, {
    deviceLabel: input.deviceLabel ?? null,
    lifetimeMs: input.rememberMe === true ? REMEMBER_ME_SESSION_LIFETIME_MS : SESSION_LIFETIME_MS,
  });
  return {
    user: {
      id: account.userId,
      email: account.email,
      displayName: account.displayName,
      instanceRole: account.instanceRole,
    },
    accessToken: session.accessToken,
    accessExpiresAt: session.accessExpiresAt,
    refreshToken: session.refreshToken,
    sessionExpiresAt: session.expiresAt,
  };
};
