// SPDX-FileCopyrightText: 2026 Dominik Wadowski
// SPDX-License-Identifier: FSL-1.1-ALv2

import { randomUUID } from "node:crypto";
import { withUserContext, type ModuleDatabase } from "@offgrid/db";
import { insertRecoveryCode } from "../infrastructure/insert-recovery-code.js";
import { retireActiveRecoveryCodes } from "../infrastructure/retire-active-recovery-codes.js";

export const rotateRecoveryCode = async (
  db: ModuleDatabase,
  userId: string,
  codeHash: string,
): Promise<void> => {
  await db.$transaction(async (tx) => {
    await withUserContext(tx, userId);
    await retireActiveRecoveryCodes(tx, userId);
    await insertRecoveryCode(tx, { id: randomUUID(), userId, codeHash });
  });
};
