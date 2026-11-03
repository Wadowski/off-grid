// SPDX-FileCopyrightText: 2026 Dominik Wadowski
// SPDX-License-Identifier: FSL-1.1-ALv2

import { randomUUID } from "node:crypto";
import { withUserContext, type ModuleDatabase } from "@offgrid/db";
import { RECOVERY_CODE_BYTES } from "../../constants.js";
import { recoveryCodeHashSchema } from "../../domain/accounts/recovery-code-hash-schema.js";
import { insertRecoveryCode } from "../../infrastructure/recovery-codes/insert-recovery-code.js";
import { retireActiveRecoveryCodes } from "../../infrastructure/recovery-codes/retire-active-recovery-codes.js";
import { digestToken } from "../../infrastructure/tokens/digest-token.js";
import { generateSecretToken } from "../../infrastructure/tokens/generate-secret-token.js";
import type { NewNotification } from "../../types.js";
import { raiseNotification } from "../notifications/raise-notification.js";
import { PasswordIncorrectError } from "../errors/password-incorrect-error.js";
import { passwordMatches } from "./password-matches.js";

export interface RegeneratedRecoveryCode {
  readonly recoveryCode: string;
  readonly notification: NewNotification;
}

export const regenerateOwnRecoveryCode = async (
  db: ModuleDatabase,
  userId: string,
  password: string,
  now: Date = new Date(),
): Promise<RegeneratedRecoveryCode> => {
  const recoveryCode = generateSecretToken(RECOVERY_CODE_BYTES);
  const codeHash = recoveryCodeHashSchema.parse(digestToken(recoveryCode));
  const notification = await db.$transaction(async (tx) => {
    await withUserContext(tx, userId);
    if (!(await passwordMatches(tx, userId, password))) {
      throw new PasswordIncorrectError();
    }
    await retireActiveRecoveryCodes(tx, userId);
    await insertRecoveryCode(tx, { id: randomUUID(), userId, codeHash });
    return raiseNotification(tx, { userId, type: "recovery-code-regenerated" }, now);
  });
  return { recoveryCode, notification };
};
