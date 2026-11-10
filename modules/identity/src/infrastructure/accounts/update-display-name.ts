// SPDX-FileCopyrightText: 2026 Dominik Wadowski
// SPDX-License-Identifier: FSL-1.1-ALv2

import type { ModuleTransaction } from "@offgrid/db";

export const updateDisplayName = async (
  tx: ModuleTransaction,
  userId: string,
  displayName: string,
): Promise<number> => {
  const updated = await tx.userAccount.update({
    where: { userId },
    data: { displayName, displayNameVersion: { increment: 1 } },
    select: { displayNameVersion: true },
  });
  return updated.displayNameVersion;
};
