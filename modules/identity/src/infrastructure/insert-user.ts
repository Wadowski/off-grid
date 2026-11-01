// SPDX-FileCopyrightText: 2026 Dominik Wadowski
// SPDX-License-Identifier: FSL-1.1-ALv2

import type { ModuleTransaction } from "@offgrid/db";
import type { NewUser, UserRecord } from "../types.js";

export const insertUser = async (tx: ModuleTransaction, user: NewUser): Promise<UserRecord> =>
  tx.userAccount.create({
    data: {
      userId: user.id,
      email: user.email,
      displayName: user.displayName,
      instanceRole: user.instanceRole,
    },
  });
