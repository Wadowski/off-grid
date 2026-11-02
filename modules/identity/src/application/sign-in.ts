// SPDX-FileCopyrightText: 2026 Dominik Wadowski
// SPDX-License-Identifier: FSL-1.1-ALv2

import type { ModuleDatabase } from "@offgrid/db";
import { REMEMBER_ME_SESSION_LIFETIME_MS, SESSION_LIFETIME_MS } from "../constants.js";
import { normalizeEmail } from "../domain/normalize-email.js";
import { normalizePassword } from "../domain/normalize-password.js";
import { dummyPasswordHash } from "../infrastructure/dummy-password-hash.js";
import { findAccountForSignIn } from "../infrastructure/find-account-for-sign-in.js";
import { verifyPassword } from "../infrastructure/verify-password.js";
import type { SignedInSession, SignInInput } from "../types.js";
import { clearSignInFailures } from "./clear-sign-in-failures.js";
import { recordSignInFailure } from "./record-sign-in-failure.js";
import { InvalidCredentialsError } from "./invalid-credentials-error.js";
import { isSignInLocked } from "./is-sign-in-locked.js";
import { issueSession } from "./issue-session.js";

export const signIn = async (
  db: ModuleDatabase,
  input: SignInInput,
  now: number = Date.now(),
): Promise<SignedInSession> => {
  const email = normalizeEmail(input.email);
  if (isSignInLocked(email, now)) {
    throw new InvalidCredentialsError();
  }
  const account = await findAccountForSignIn(db, email);
  const passwordHash = account?.passwordHash ?? (await dummyPasswordHash());
  const passwordMatches = await verifyPassword(passwordHash, normalizePassword(input.password));
  if (account === null || !passwordMatches || account.status !== "active") {
    recordSignInFailure(email, now);
    throw new InvalidCredentialsError();
  }
  clearSignInFailures(email);
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
