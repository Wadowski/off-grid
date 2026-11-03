// SPDX-FileCopyrightText: 2026 Dominik Wadowski
// SPDX-License-Identifier: FSL-1.1-ALv2

import type { ModuleDatabase } from "@offgrid/db";
import { emailSchema } from "../../domain/email/email-schema.js";
import { normalizeEmail } from "../../domain/email/normalize-email.js";
import { findAccountForSignIn } from "../../infrastructure/accounts/find-account-for-sign-in.js";
import type { IssuedPasswordReset } from "../../types.js";
import { AccountNotFoundError } from "../errors/account-not-found-error.js";
import { issuePasswordReset } from "./issue-password-reset.js";

export const resetAdminPasswordByEmail = async (
  db: ModuleDatabase,
  email: string,
  now: Date = new Date(),
): Promise<IssuedPasswordReset> => {
  const account = await findAccountForSignIn(db, normalizeEmail(emailSchema.parse(email)));
  if (account === null || account.instanceRole !== "admin") {
    throw new AccountNotFoundError();
  }
  return db.$transaction((tx) => issuePasswordReset(tx, account.userId, now));
};
