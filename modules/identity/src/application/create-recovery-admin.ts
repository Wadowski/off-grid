// SPDX-FileCopyrightText: 2026 Dominik Wadowski
// SPDX-License-Identifier: FSL-1.1-ALv2

import { randomUUID } from "node:crypto";
import { withUserContext, type ModuleDatabase } from "@offgrid/db";
import { displayNameSchema } from "@offgrid/contracts";
import { ACCESS_TOKEN_BYTES, USER_ACCOUNT_MODEL } from "../constants.js";
import { emailSchema } from "../domain/email-schema.js";
import { normalizeEmail } from "../domain/normalize-email.js";
import { publishUserCreated } from "../events/publish-user-created.js";
import { countActiveAdmins } from "../infrastructure/count-active-admins.js";
import { generateSecretToken } from "../infrastructure/generate-secret-token.js";
import { hashPassword } from "../infrastructure/hash-password.js";
import { insertCredential } from "../infrastructure/insert-credential.js";
import { insertUser } from "../infrastructure/insert-user.js";
import { lockInstanceSettings } from "../infrastructure/lock-instance-settings.js";
import { uniqueViolationModel } from "../infrastructure/unique-violation-model.js";
import type { CreateRecoveryAdminInput, IssuedPasswordReset } from "../types.js";
import { AdminAlreadyActiveError } from "./admin-already-active-error.js";
import { EmailTakenError } from "./email-taken-error.js";
import { issuePasswordReset } from "./issue-password-reset.js";

export const createRecoveryAdmin = async (
  db: ModuleDatabase,
  input: CreateRecoveryAdminInput,
  now: Date = new Date(),
): Promise<IssuedPasswordReset> => {
  const email = normalizeEmail(emailSchema.parse(input.email));
  const displayName = displayNameSchema.parse(input.displayName);
  const userId = randomUUID();
  return db.$transaction(async (tx) => {
    await lockInstanceSettings(tx);
    if ((await countActiveAdmins(tx)) > 0) {
      throw new AdminAlreadyActiveError();
    }
    await withUserContext(tx, userId);
    try {
      await insertUser(tx, { id: userId, email, displayName, instanceRole: "admin" });
    } catch (error) {
      if (uniqueViolationModel(error) === USER_ACCOUNT_MODEL) {
        throw new EmailTakenError();
      }
      throw error;
    }
    await insertCredential(tx, userId, await hashPassword(generateSecretToken(ACCESS_TOKEN_BYTES)));
    await publishUserCreated(tx, { userId, displayName });
    return issuePasswordReset(tx, userId, now);
  });
};
