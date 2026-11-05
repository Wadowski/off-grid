// SPDX-FileCopyrightText: 2026 Dominik Wadowski
// SPDX-License-Identifier: FSL-1.1-ALv2

import { withUserContext, type ModuleDatabase } from "@offgrid/db";
import { isUsablePasswordReset } from "../../domain/password-reset/is-usable-password-reset.js";
import { normalizeResetCode } from "../../domain/password-reset/normalize-reset-code.js";
import { digestToken } from "../../infrastructure/tokens/digest-token.js";
import { findAccount } from "../../infrastructure/accounts/find-account.js";
import { findPasswordResetByCode } from "../../infrastructure/password-resets/find-password-reset-by-code.js";
import { markPasswordResetUsed } from "../../infrastructure/password-resets/mark-password-reset-used.js";
import { setResetCodeHash } from "../../infrastructure/password-resets/set-reset-code-hash.js";
import type { CompletePasswordResetInput, PasswordResetOutcome } from "../../types.js";
import { InvalidResetCodeError } from "../errors/invalid-reset-code-error.js";
import { applyPasswordReset } from "./apply-password-reset.js";

export const completePasswordReset = (
  db: ModuleDatabase,
  input: CompletePasswordResetInput,
  now: Date = new Date(),
): Promise<PasswordResetOutcome> =>
  db.$transaction(async (tx) => {
    const codeHash = digestToken(normalizeResetCode(input.code));
    await setResetCodeHash(tx, codeHash);
    const reset = await findPasswordResetByCode(tx, codeHash);
    if (reset === null || !isUsablePasswordReset(reset, now)) {
      throw new InvalidResetCodeError();
    }
    await withUserContext(tx, reset.userId);
    const account = await findAccount(tx, reset.userId);
    if (account === null || account.status !== "active") {
      throw new InvalidResetCodeError();
    }
    if (!(await markPasswordResetUsed(tx, reset.passwordResetId, now))) {
      throw new InvalidResetCodeError();
    }
    return applyPasswordReset(tx, reset.userId, input.password, now);
  });
