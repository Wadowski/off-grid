// SPDX-FileCopyrightText: 2026 Dominik Wadowski
// SPDX-License-Identifier: FSL-1.1-ALv2

import { withUserContext, type ModuleDatabase } from "@offgrid/db";
import { findPasswordProblems } from "../domain/find-password-problems.js";
import { isUsablePasswordReset } from "../domain/is-usable-password-reset.js";
import { normalizePassword } from "../domain/normalize-password.js";
import { normalizeResetCode } from "../domain/normalize-reset-code.js";
import { personalPasswordFragments } from "../domain/personal-password-fragments.js";
import { digestToken } from "../infrastructure/digest-token.js";
import { findAccount } from "../infrastructure/find-account.js";
import { findPasswordResetByCode } from "../infrastructure/find-password-reset-by-code.js";
import { hashPassword } from "../infrastructure/hash-password.js";
import { markPasswordResetUsed } from "../infrastructure/mark-password-reset-used.js";
import { revokeAllSessions } from "../infrastructure/revoke-all-sessions.js";
import { setCredentialHash } from "../infrastructure/set-credential-hash.js";
import { setResetCodeHash } from "../infrastructure/set-reset-code-hash.js";
import type { CompletePasswordResetInput } from "../types.js";
import { InvalidResetCodeError } from "./invalid-reset-code-error.js";
import { PasswordRejectedError } from "./password-rejected-error.js";

export const completePasswordReset = (
  db: ModuleDatabase,
  input: CompletePasswordResetInput,
  now: Date = new Date(),
): Promise<void> =>
  db.$transaction(async (tx) => {
    const codeHash = digestToken(normalizeResetCode(input.code));
    await setResetCodeHash(tx, codeHash);
    const reset = await findPasswordResetByCode(tx, codeHash);
    if (reset === null || !isUsablePasswordReset(reset, now)) {
      throw new InvalidResetCodeError();
    }
    await withUserContext(tx, reset.userId);
    const account = await findAccount(tx, reset.userId);
    if (account === null || account.status !== "active") {
      throw new InvalidResetCodeError();
    }
    const password = normalizePassword(input.password);
    const problems = findPasswordProblems(
      password,
      personalPasswordFragments(account.email, account.displayName),
    );
    if (problems.length > 0) {
      throw new PasswordRejectedError(problems);
    }
    if (!(await markPasswordResetUsed(tx, reset.passwordResetId, now))) {
      throw new InvalidResetCodeError();
    }
    await setCredentialHash(tx, reset.userId, await hashPassword(password), now);
    await revokeAllSessions(tx, reset.userId);
  });
