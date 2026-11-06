// SPDX-FileCopyrightText: 2026 Dominik Wadowski
// SPDX-License-Identifier: FSL-1.1-ALv2

import { withUserContext, type ModuleDatabase } from "@offgrid/db";
import { RECOVERY_ATTEMPT_POLICY } from "../../constants.js";
import { normalizeEmail } from "../../domain/email/normalize-email.js";
import { findAccountForSignIn } from "../../infrastructure/accounts/find-account-for-sign-in.js";
import { attemptKey } from "../../infrastructure/attempt-counters/attempt-key.js";
import { consumeRecoveryCode } from "../../infrastructure/recovery-codes/consume-recovery-code.js";
import { digestToken } from "../../infrastructure/tokens/digest-token.js";
import type { PasswordResetOutcome, RecoverWithRecoveryCodeInput } from "../../types.js";
import { applyPasswordReset } from "../password-reset/apply-password-reset.js";
import { clearFailedAttempts } from "../attempt-throttle/clear-failed-attempts.js";
import { isAttemptLocked } from "../attempt-throttle/is-attempt-locked.js";
import { recordFailedAttempt } from "../attempt-throttle/record-failed-attempt.js";
import { InvalidRecoveryCodeError } from "../errors/invalid-recovery-code-error.js";
import { RecoveryLockedError } from "../errors/recovery-locked-error.js";

export const recoverWithRecoveryCode = async (
  db: ModuleDatabase,
  input: RecoverWithRecoveryCodeInput,
  now: Date = new Date(),
): Promise<PasswordResetOutcome> => {
  const email = normalizeEmail(input.email);
  const key = attemptKey("recovery", email);
  if (await isAttemptLocked(db, key, now)) {
    throw new RecoveryLockedError();
  }
  const codeHash = digestToken(input.recoveryCode.trim());
  const account = await findAccountForSignIn(db, email);
  try {
    const outcome = await db.$transaction(async (tx) => {
      if (account === null || account.status !== "active") {
        throw new InvalidRecoveryCodeError();
      }
      await withUserContext(tx, account.userId);
      if (!(await consumeRecoveryCode(tx, account.userId, codeHash))) {
        throw new InvalidRecoveryCodeError();
      }
      return applyPasswordReset(tx, account.userId, input.password, now);
    });
    await clearFailedAttempts(db, key);
    return outcome;
  } catch (error) {
    if (error instanceof InvalidRecoveryCodeError) {
      await recordFailedAttempt(db, key, RECOVERY_ATTEMPT_POLICY, now);
    }
    throw error;
  }
};
