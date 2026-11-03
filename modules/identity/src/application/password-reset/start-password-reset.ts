// SPDX-FileCopyrightText: 2026 Dominik Wadowski
// SPDX-License-Identifier: FSL-1.1-ALv2

import { withUserContext, type ModuleDatabase } from "@offgrid/db";
import { findAccount } from "../../infrastructure/accounts/find-account.js";
import type { IssuedPasswordReset } from "../../types.js";
import { AccountNotFoundError } from "../errors/account-not-found-error.js";
import { assertActiveAdmin } from "../admin/assert-active-admin.js";
import { issuePasswordReset } from "./issue-password-reset.js";

export const startPasswordReset = (
  db: ModuleDatabase,
  actorUserId: string,
  targetUserId: string,
  now: Date = new Date(),
): Promise<IssuedPasswordReset> =>
  db.$transaction(async (tx) => {
    await withUserContext(tx, actorUserId);
    await assertActiveAdmin(tx, actorUserId);
    if ((await findAccount(tx, targetUserId)) === null) {
      throw new AccountNotFoundError();
    }
    return issuePasswordReset(tx, targetUserId, now);
  });
