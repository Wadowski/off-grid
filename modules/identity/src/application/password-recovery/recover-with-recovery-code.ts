// SPDX-FileCopyrightText: 2026 Dominik Wadowski
// SPDX-License-Identifier: FSL-1.1-ALv2

import { withUserContext, type ModuleDatabase } from "@offgrid/db";
import { normalizeEmail } from "../../domain/email/normalize-email.js";
import { findAccountForSignIn } from "../../infrastructure/accounts/find-account-for-sign-in.js";
import { consumeRecoveryCode } from "../../infrastructure/recovery-codes/consume-recovery-code.js";
import { digestToken } from "../../infrastructure/tokens/digest-token.js";
import type { PasswordResetOutcome, RecoverWithRecoveryCodeInput } from "../../types.js";
import { applyPasswordReset } from "../password-reset/apply-password-reset.js";
import { clearRecoveryFailures } from "../recovery-throttle/clear-recovery-failures.js";
import { isRecoveryLocked } from "../recovery-throttle/is-recovery-locked.js";
import { recordRecoveryFailure } from "../recovery-throttle/record-recovery-failure.js";
import { InvalidRecoveryCodeError } from "../errors/invalid-recovery-code-error.js";
import { RecoveryLockedError } from "../errors/recovery-locked-error.js";

export const recoverWithRecoveryCode = async (
  db: ModuleDatabase,
  input: RecoverWithRecoveryCodeInput,
  now: Date = new Date(),
): Promise<PasswordResetOutcome> => {
  const email = normalizeEmail(input.email);
  if (isRecoveryLocked(email, now.getTime())) {
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
    clearRecoveryFailures(email);
    return outcome;
  } catch (error) {
    if (error instanceof InvalidRecoveryCodeError) {
      recordRecoveryFailure(email, now.getTime());
    }
    throw error;
  }
};
