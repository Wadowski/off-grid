// SPDX-FileCopyrightText: 2026 Dominik Wadowski
// SPDX-License-Identifier: FSL-1.1-ALv2

import type { AccountSnapshot } from "../types.js";
import { hasActiveAdmin } from "./has-active-admin.js";

export const canDisableAccount = (
  accounts: readonly AccountSnapshot[],
  userId: string,
): boolean => {
  const target = accounts.find((account) => account.userId === userId);
  if (target === undefined || target.instanceRole !== "admin" || target.status !== "active") {
    return true;
  }
  return hasActiveAdmin(accounts.filter((account) => account.userId !== userId));
};
