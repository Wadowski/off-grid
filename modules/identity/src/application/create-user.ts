// SPDX-FileCopyrightText: 2026 Dominik Wadowski
// SPDX-License-Identifier: FSL-1.1-ALv2

import { randomUUID } from "node:crypto";
import { withUserContext, type ModuleDatabase } from "@offgrid/db";
import { createUserInputSchema } from "../domain/create-user-input-schema.js";
import { initialInstanceRole } from "../domain/initial-instance-role.js";
import { publishUserCreated } from "../events/publish-user-created.js";
import { claimFirstAdmin } from "../infrastructure/claim-first-admin.js";
import { countUsers } from "../infrastructure/count-users.js";
import { insertCredential } from "../infrastructure/insert-credential.js";
import { insertRecoveryCode } from "../infrastructure/insert-recovery-code.js";
import { insertUser } from "../infrastructure/insert-user.js";
import { readInstanceSettings } from "../infrastructure/read-instance-settings.js";
import { toUser } from "../infrastructure/to-user.js";
import type { CreateUserInput, User } from "../types.js";
import { RegistrationClosedError } from "./registration-closed-error.js";

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
