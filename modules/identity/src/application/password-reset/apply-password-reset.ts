// SPDX-FileCopyrightText: 2026 Dominik Wadowski
// SPDX-License-Identifier: FSL-1.1-ALv2

import { randomUUID } from "node:crypto";
import type { ModuleTransaction } from "@offgrid/db";
import { RECOVERY_CODE_BYTES } from "../../constants.js";
import { recoveryCodeHashSchema } from "../../domain/accounts/recovery-code-hash-schema.js";
import { findPasswordProblems } from "../../domain/password/find-password-problems.js";
import { normalizePassword } from "../../domain/password/normalize-password.js";
import { personalPasswordFragments } from "../../domain/password/personal-password-fragments.js";
import { findAccount } from "../../infrastructure/accounts/find-account.js";
import { hashPassword } from "../../infrastructure/credentials/hash-password.js";
import { setCredentialHash } from "../../infrastructure/credentials/set-credential-hash.js";
import { insertRecoveryCode } from "../../infrastructure/recovery-codes/insert-recovery-code.js";
import { retireActiveRecoveryCodes } from "../../infrastructure/recovery-codes/retire-active-recovery-codes.js";
import { revokeAllSessions } from "../../infrastructure/sessions/revoke-all-sessions.js";
import { digestToken } from "../../infrastructure/tokens/digest-token.js";
import { generateSecretToken } from "../../infrastructure/tokens/generate-secret-token.js";
import type { PasswordResetOutcome } from "../../types.js";
import { passwordChangedV1 } from "@offgrid/contracts";
import { publishUserFact } from "../../events/publish-user-fact.js";
import { AccountNotFoundError } from "../errors/account-not-found-error.js";
import { PasswordRejectedError } from "../errors/password-rejected-error.js";

export const applyPasswordReset = async (
  tx: ModuleTransaction,
  userId: string,
  password: string,
  now: Date,
): Promise<PasswordResetOutcome> => {
  const account = await findAccount(tx, userId);
  if (account === null) {
    throw new AccountNotFoundError();
  }
  const normalizedPassword = normalizePassword(password);
  const problems = findPasswordProblems(
    normalizedPassword,
    personalPasswordFragments(account.email, account.displayName),
  );
  if (problems.length > 0) {
    throw new PasswordRejectedError(problems);
  }
  await setCredentialHash(tx, userId, await hashPassword(normalizedPassword), now);
  await revokeAllSessions(tx, userId);
  const recoveryCode = generateSecretToken(RECOVERY_CODE_BYTES);
  await retireActiveRecoveryCodes(tx, userId);
  await insertRecoveryCode(tx, {
    id: randomUUID(),
    userId,
    codeHash: recoveryCodeHashSchema.parse(digestToken(recoveryCode)),
  });
  await publishUserFact(tx, passwordChangedV1, userId, now);
  return { recoveryCode };
};
