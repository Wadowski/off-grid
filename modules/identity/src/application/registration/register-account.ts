// SPDX-FileCopyrightText: 2026 Dominik Wadowski
// SPDX-License-Identifier: FSL-1.1-ALv2

import { displayNameSchema } from "@offgrid/contracts";
import type { ModuleDatabase } from "@offgrid/db";
import { RECOVERY_CODE_BYTES } from "../../constants.js";
import { emailSchema } from "../../domain/email/email-schema.js";
import { findPasswordProblems } from "../../domain/password/find-password-problems.js";
import { normalizeEmail } from "../../domain/email/normalize-email.js";
import { normalizePassword } from "../../domain/password/normalize-password.js";
import { personalPasswordFragments } from "../../domain/password/personal-password-fragments.js";
import { digestToken } from "../../infrastructure/tokens/digest-token.js";
import { generateSecretToken } from "../../infrastructure/tokens/generate-secret-token.js";
import { hashPassword } from "../../infrastructure/credentials/hash-password.js";
import type { RegisteredAccount, RegisterAccountInput } from "../../types.js";
import { createAccountUser } from "./create-account-user.js";
import { issueSession } from "../sessions/issue-session.js";
import { PasswordRejectedError } from "../errors/password-rejected-error.js";

export const registerAccount = async (
  db: ModuleDatabase,
  input: RegisterAccountInput,
): Promise<RegisteredAccount> => {
  const email = normalizeEmail(emailSchema.parse(input.email));
  const displayName = displayNameSchema.parse(input.displayName);
  const password = normalizePassword(input.password);
  const problems = findPasswordProblems(password, personalPasswordFragments(email, displayName));
  if (problems.length > 0) {
    throw new PasswordRejectedError(problems);
  }
  const passwordHash = await hashPassword(password);
  const recoveryCode = generateSecretToken(RECOVERY_CODE_BYTES);
  const user = await createAccountUser(db, {
    email,
    displayName,
    passwordHash,
    recoveryCodeHash: digestToken(recoveryCode),
  });
  const session = await issueSession(db, user.id);
  return {
    user,
    recoveryCode,
    refreshToken: session.refreshToken,
    sessionExpiresAt: session.expiresAt,
  };
};
