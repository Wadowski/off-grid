// SPDX-FileCopyrightText: 2026 Dominik Wadowski
// SPDX-License-Identifier: FSL-1.1-ALv2

import { withUserContext, type ModuleDatabase } from "@offgrid/db";
import { RECOVERY_ATTEMPT_POLICY } from "../../constants.js";
import { normalizeEmail } from "../../domain/email/normalize-email.js";
import { isUsablePasswordReset } from "../../domain/password-reset/is-usable-password-reset.js";
import { normalizeResetCode } from "../../domain/password-reset/normalize-reset-code.js";
import { findAccountForSignIn } from "../../infrastructure/accounts/find-account-for-sign-in.js";
import { attemptKey } from "../../infrastructure/attempt-counters/attempt-key.js";
import { digestToken } from "../../infrastructure/tokens/digest-token.js";
import { findPasswordResetByCode } from "../../infrastructure/password-resets/find-password-reset-by-code.js";
import { markPasswordResetUsed } from "../../infrastructure/password-resets/mark-password-reset-used.js";
import { setResetCodeHash } from "../../infrastructure/password-resets/set-reset-code-hash.js";
import type { CompletePasswordResetInput, PasswordResetOutcome } from "../../types.js";
import { clearFailedAttempts } from "../attempt-throttle/clear-failed-attempts.js";
import { isAttemptLocked } from "../attempt-throttle/is-attempt-locked.js";
import { recordFailedAttempt } from "../attempt-throttle/record-failed-attempt.js";
import { InvalidResetCodeError } from "../errors/invalid-reset-code-error.js";
import { RecoveryLockedError } from "../errors/recovery-locked-error.js";
import { applyPasswordReset } from "./apply-password-reset.js";

export const completePasswordReset = async (
  db: ModuleDatabase,
  input: CompletePasswordResetInput,
  now: Date = new Date(),
): Promise<PasswordResetOutcome> => {
  const email = normalizeEmail(input.email);
  const key = attemptKey("recovery", email);
  if (await isAttemptLocked(db, key, now)) {
    throw new RecoveryLockedError();
  }
  const codeHash = digestToken(normalizeResetCode(input.code));
  const account = await findAccountForSignIn(db, email);
  try {
    const outcome = await db.$transaction(async (tx) => {
      await setResetCodeHash(tx, codeHash);
      const reset = await findPasswordResetByCode(tx, codeHash);
      if (
        account === null ||
        account.status !== "active" ||
        reset === null ||
        reset.userId !== account.userId ||
        !isUsablePasswordReset(reset, now)
      ) {
        throw new InvalidResetCodeError();
      }
      await withUserContext(tx, account.userId);
      if (!(await markPasswordResetUsed(tx, reset.passwordResetId, now))) {
        throw new InvalidResetCodeError();
      }
      return applyPasswordReset(tx, account.userId, input.password, now);
    });
    await clearFailedAttempts(db, key);
    return outcome;
  } catch (error) {
    if (error instanceof InvalidResetCodeError) {
      await recordFailedAttempt(db, key, RECOVERY_ATTEMPT_POLICY, now);
    }
    throw error;
  }
};
