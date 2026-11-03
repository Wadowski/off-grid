// SPDX-FileCopyrightText: 2026 Dominik Wadowski
// SPDX-License-Identifier: FSL-1.1-ALv2

import type { ModuleTransaction } from "@offgrid/db";
import type { User } from "../../types.js";
import { toUser } from "./to-user.js";

export const listAccounts = async (tx: ModuleTransaction): Promise<User[]> => {
  const accounts = await tx.userAccount.findMany({ orderBy: { createdAt: "asc" } });
  return accounts.map(toUser);
};
