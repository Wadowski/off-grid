// SPDX-FileCopyrightText: 2026 Dominik Wadowski
// SPDX-License-Identifier: FSL-1.1-ALv2

import { withUserContext, type ModuleDatabase } from "@offgrid/db";
import { RECOVERY_CODE_BYTES } from "../../constants.js";
import { digestToken } from "../../infrastructure/tokens/digest-token.js";
import { generateSecretToken } from "../../infrastructure/tokens/generate-secret-token.js";
import { rotateRecoveryCode } from "../password-reset/rotate-recovery-code.js";
import { PasswordIncorrectError } from "../errors/password-incorrect-error.js";
import { passwordMatches } from "./password-matches.js";

export const regenerateOwnRecoveryCode = async (
  db: ModuleDatabase,
  userId: string,
  password: string,
): Promise<string> => {
  const matches = await db.$transaction(async (tx) => {
    await withUserContext(tx, userId);
    return passwordMatches(tx, userId, password);
  });
  if (!matches) {
    throw new PasswordIncorrectError();
  }
  const recoveryCode = generateSecretToken(RECOVERY_CODE_BYTES);
  await rotateRecoveryCode(db, userId, digestToken(recoveryCode));
  return recoveryCode;
};
