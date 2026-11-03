// SPDX-FileCopyrightText: 2026 Dominik Wadowski
// SPDX-License-Identifier: FSL-1.1-ALv2

import type { ModuleTransaction } from "@offgrid/db";
import type { AccountStatus } from "../../types.js";

export const setAccountStatus = async (
  tx: ModuleTransaction,
  userId: string,
  status: AccountStatus,
): Promise<void> => {
  await tx.userAccount.update({ where: { userId }, data: { status } });
};
