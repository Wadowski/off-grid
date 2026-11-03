// SPDX-FileCopyrightText: 2026 Dominik Wadowski
// SPDX-License-Identifier: FSL-1.1-ALv2

import { withUserContext, type ModuleDatabase } from "@offgrid/db";
import { findAccount } from "../../infrastructure/accounts/find-account.js";
import { AccountNotFoundError } from "../errors/account-not-found-error.js";
import type { OwnProfile } from "../../types.js";

export const getOwnProfile = (db: ModuleDatabase, userId: string): Promise<OwnProfile> =>
  db.$transaction(async (tx) => {
    await withUserContext(tx, userId);
    const account = await findAccount(tx, userId);
    if (account === null) {
      throw new AccountNotFoundError();
    }
    return {
      id: account.id,
      email: account.email,
      displayName: account.displayName,
      instanceRole: account.instanceRole,
    };
  });
