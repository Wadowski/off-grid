// SPDX-FileCopyrightText: 2026 Dominik Wadowski
// SPDX-License-Identifier: FSL-1.1-ALv2

import type { ModuleTransaction } from "@offgrid/db";

export const listAccountNames = async (
  tx: ModuleTransaction,
  userIds: readonly string[],
): Promise<Map<string, string>> => {
  const records = await tx.familyAccountName.findMany({
    where: { userId: { in: [...userIds] } },
    select: { userId: true, displayName: true },
  });
  return new Map(records.map((record) => [record.userId, record.displayName]));
};
