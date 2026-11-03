// SPDX-FileCopyrightText: 2026 Dominik Wadowski
// SPDX-License-Identifier: FSL-1.1-ALv2

import { randomUUID } from "node:crypto";
import { withUserContext, type ModuleDatabase } from "@offgrid/db";
import { createUserInputSchema } from "../../domain/accounts/create-user-input-schema.js";
import { initialInstanceRole } from "../../domain/accounts/initial-instance-role.js";
import { publishUserCreated } from "../../events/publish-user-created.js";
import { claimFirstAdmin } from "../../infrastructure/accounts/claim-first-admin.js";
import { countUsers } from "../../infrastructure/accounts/count-users.js";
import { insertCredential } from "../../infrastructure/credentials/insert-credential.js";
import { insertRecoveryCode } from "../../infrastructure/recovery-codes/insert-recovery-code.js";
import { insertUser } from "../../infrastructure/accounts/insert-user.js";
import { readInstanceSettings } from "../../infrastructure/instance-settings/read-instance-settings.js";
import { toUser } from "../../infrastructure/accounts/to-user.js";
import type { CreateUserInput, User } from "../../types.js";
import { RegistrationClosedError } from "../errors/registration-closed-error.js";

export const createUser = async (db: ModuleDatabase, input: CreateUserInput): Promise<User> => {
  const parsed = createUserInputSchema.parse(input);
  const id = randomUUID();
  return db.$transaction(async (tx) => {
    await withUserContext(tx, id);
    const instanceRole = initialInstanceRole(await countUsers(tx));
    if (instanceRole === "admin") {
      await claimFirstAdmin(tx);
    } else if (!(await readInstanceSettings(tx)).registrationOpen) {
      throw new RegistrationClosedError();
    }
    const record = await insertUser(tx, {
      id,
      email: parsed.email,
      displayName: parsed.displayName,
      instanceRole,
    });
    await insertCredential(tx, id, parsed.passwordHash);
    await insertRecoveryCode(tx, {
      id: randomUUID(),
      userId: id,
      codeHash: parsed.recoveryCodeHash,
    });
    await publishUserCreated(tx, { userId: id, displayName: parsed.displayName });
    return toUser(record);
  });
};
