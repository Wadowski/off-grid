// SPDX-FileCopyrightText: 2026 Dominik Wadowski
// SPDX-License-Identifier: FSL-1.1-ALv2

import { randomUUID } from "node:crypto";
import { withUserContext, type ModuleDatabase } from "@offgrid/db";
import { displayNameSchema } from "@offgrid/contracts";
import { ACCESS_TOKEN_BYTES, USER_ACCOUNT_MODEL } from "../../constants.js";
import { emailSchema } from "../../domain/email/email-schema.js";
import { normalizeEmail } from "../../domain/email/normalize-email.js";
import { publishUserCreated } from "../../events/publish-user-created.js";
import { claimFirstAdmin } from "../../infrastructure/accounts/claim-first-admin.js";
import { countActiveAdmins } from "../../infrastructure/accounts/count-active-admins.js";
import { countUsers } from "../../infrastructure/accounts/count-users.js";
import { generateSecretToken } from "../../infrastructure/tokens/generate-secret-token.js";
import { hashPassword } from "../../infrastructure/credentials/hash-password.js";
import { insertCredential } from "../../infrastructure/credentials/insert-credential.js";
import { insertUser } from "../../infrastructure/accounts/insert-user.js";
import { lockInstanceSettings } from "../../infrastructure/instance-settings/lock-instance-settings.js";
import { uniqueViolationModel } from "../../infrastructure/database/unique-violation-model.js";
import type { CreateRecoveryAdminInput, IssuedPasswordReset } from "../../types.js";
import { AdminAlreadyActiveError } from "../errors/admin-already-active-error.js";
import { EmailTakenError } from "../errors/email-taken-error.js";
import { issuePasswordReset } from "../password-reset/issue-password-reset.js";

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
    if ((await countUsers(tx)) === 0) {
      await claimFirstAdmin(tx);
    }
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
