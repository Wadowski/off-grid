// SPDX-FileCopyrightText: 2026 Dominik Wadowski
// SPDX-License-Identifier: FSL-1.1-ALv2

import { withUserContext, type ModuleDatabase } from "@offgrid/db";
import type { User } from "../types.js";
import { listAccounts } from "../infrastructure/list-accounts.js";
import { assertActiveAdmin } from "./assert-active-admin.js";

export const listUsers = (db: ModuleDatabase, actorUserId: string): Promise<User[]> =>
  db.$transaction(async (tx) => {
    await withUserContext(tx, actorUserId);
    await assertActiveAdmin(tx, actorUserId);
    return listAccounts(tx);
  });
