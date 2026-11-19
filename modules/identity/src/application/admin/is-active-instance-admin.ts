// SPDX-FileCopyrightText: 2026 Dominik Wadowski
// SPDX-License-Identifier: FSL-1.1-ALv2

import { withUserContext, type ModuleDatabase } from "@offgrid/db";
import { isActiveAdmin } from "../../domain/accounts/is-active-admin.js";
import { findAccount } from "../../infrastructure/accounts/find-account.js";

export const isActiveInstanceAdmin = (db: ModuleDatabase, userId: string): Promise<boolean> =>
  db.$transaction(async (tx) => {
    await withUserContext(tx, userId);
    const account = await findAccount(tx, userId);
    return account !== null && isActiveAdmin(account);
  });
