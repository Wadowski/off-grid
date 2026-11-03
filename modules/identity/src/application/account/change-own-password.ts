// SPDX-FileCopyrightText: 2026 Dominik Wadowski
// SPDX-License-Identifier: FSL-1.1-ALv2

import { withUserContext, type ModuleDatabase } from "@offgrid/db";
import { findPasswordProblems } from "../../domain/password/find-password-problems.js";
import { normalizePassword } from "../../domain/password/normalize-password.js";
import { personalPasswordFragments } from "../../domain/password/personal-password-fragments.js";
import { findAccount } from "../../infrastructure/accounts/find-account.js";
import { hashPassword } from "../../infrastructure/credentials/hash-password.js";
import { setCredentialHash } from "../../infrastructure/credentials/set-credential-hash.js";
import { revokeOtherSessions } from "../../infrastructure/sessions/revoke-other-sessions.js";
import type { ChangePasswordInput } from "../../types.js";
import { AccountNotFoundError } from "../errors/account-not-found-error.js";
import { CurrentPasswordIncorrectError } from "../errors/current-password-incorrect-error.js";
import { PasswordRejectedError } from "../errors/password-rejected-error.js";
import { passwordMatches } from "./password-matches.js";

export const changeOwnPassword = (
  db: ModuleDatabase,
  userId: string,
  currentSessionId: string,
  input: ChangePasswordInput,
  now: Date = new Date(),
): Promise<void> =>
  db.$transaction(async (tx) => {
    await withUserContext(tx, userId);
    if (!(await passwordMatches(tx, userId, input.currentPassword))) {
      throw new CurrentPasswordIncorrectError();
    }
    const account = await findAccount(tx, userId);
    if (account === null) {
      throw new AccountNotFoundError();
    }
    const newPassword = normalizePassword(input.newPassword);
    const problems = findPasswordProblems(
      newPassword,
      personalPasswordFragments(account.email, account.displayName),
    );
    if (problems.length > 0) {
      throw new PasswordRejectedError(problems);
    }
    await setCredentialHash(tx, userId, await hashPassword(newPassword), now);
    await revokeOtherSessions(tx, userId, currentSessionId);
  });
