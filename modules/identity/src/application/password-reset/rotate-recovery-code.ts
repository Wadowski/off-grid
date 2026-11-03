// SPDX-FileCopyrightText: 2026 Dominik Wadowski
// SPDX-License-Identifier: FSL-1.1-ALv2

import { randomUUID } from "node:crypto";
import { userIdSchema } from "@offgrid/contracts";
import { withUserContext, type ModuleDatabase } from "@offgrid/db";
import { recoveryCodeHashSchema } from "../../domain/accounts/recovery-code-hash-schema.js";
import { insertRecoveryCode } from "../../infrastructure/recovery-codes/insert-recovery-code.js";
import { retireActiveRecoveryCodes } from "../../infrastructure/recovery-codes/retire-active-recovery-codes.js";

export const rotateRecoveryCode = async (
  db: ModuleDatabase,
  userId: string,
  codeHash: string,
): Promise<void> => {
  const parsedUserId = userIdSchema.parse(userId);
  const parsedCodeHash = recoveryCodeHashSchema.parse(codeHash);
  await db.$transaction(async (tx) => {
    await withUserContext(tx, parsedUserId);
    await retireActiveRecoveryCodes(tx, parsedUserId);
    await insertRecoveryCode(tx, {
      id: randomUUID(),
      userId: parsedUserId,
      codeHash: parsedCodeHash,
    });
  });
};
