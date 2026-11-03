// SPDX-FileCopyrightText: 2026 Dominik Wadowski
// SPDX-License-Identifier: FSL-1.1-ALv2

import type { ModuleTransaction } from "@offgrid/db";
import { z } from "zod";
import { ACCOUNT_STATUSES, INSTANCE_ROLES } from "../constants.js";
import type { AccountSnapshot } from "../types.js";

export const listAccountSnapshots = async (tx: ModuleTransaction): Promise<AccountSnapshot[]> => {
  const accounts = await tx.userAccount.findMany({
    select: { userId: true, instanceRole: true, status: true },
  });
  return accounts.map((account) => ({
    userId: account.userId,
    instanceRole: z.enum(INSTANCE_ROLES).parse(account.instanceRole),
    status: z.enum(ACCOUNT_STATUSES).parse(account.status),
  }));
};
