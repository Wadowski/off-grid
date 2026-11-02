// SPDX-FileCopyrightText: 2026 Dominik Wadowski
// SPDX-License-Identifier: FSL-1.1-ALv2

import type { ModuleTransaction } from "@offgrid/db";
import type { User } from "../types.js";
import { toUser } from "./to-user.js";

export const findAccount = async (tx: ModuleTransaction, userId: string): Promise<User | null> => {
  const account = await tx.userAccount.findUnique({ where: { userId } });
  return account === null ? null : toUser(account);
};
