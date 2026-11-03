// SPDX-FileCopyrightText: 2026 Dominik Wadowski
// SPDX-License-Identifier: FSL-1.1-ALv2

import { randomUUID } from "node:crypto";
import { withUserContext, type ModuleTransaction } from "@offgrid/db";
import { RESET_CODE_LIFETIME_MS } from "../constants.js";
import { normalizeResetCode } from "../domain/normalize-reset-code.js";
import { digestToken } from "../infrastructure/digest-token.js";
import { generateResetCode } from "../infrastructure/generate-reset-code.js";
import { insertPasswordReset } from "../infrastructure/insert-password-reset.js";
import { retireActivePasswordResets } from "../infrastructure/retire-active-password-resets.js";
import { revokeAllSessions } from "../infrastructure/revoke-all-sessions.js";
import type { IssuedPasswordReset } from "../types.js";

export const issuePasswordReset = async (
  tx: ModuleTransaction,
  userId: string,
  now: Date,
): Promise<IssuedPasswordReset> => {
  await withUserContext(tx, userId);
  await retireActivePasswordResets(tx, userId, now);
  await revokeAllSessions(tx, userId);
  const code = generateResetCode();
  const expiresAt = new Date(now.getTime() + RESET_CODE_LIFETIME_MS);
  await insertPasswordReset(tx, {
    id: randomUUID(),
    userId,
    codeHash: digestToken(normalizeResetCode(code)),
    expiresAt,
  });
  return { userId, code, expiresAt };
};
