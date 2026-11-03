// SPDX-FileCopyrightText: 2026 Dominik Wadowski
// SPDX-License-Identifier: FSL-1.1-ALv2

import type { ModuleTransaction } from "@offgrid/db";

export const retireActiveRecoveryCodes = async (
  tx: ModuleTransaction,
  userId: string,
): Promise<void> => {
  await tx.recoveryCode.updateMany({
    where: { userId, usedAt: null, retiredAt: null },
    data: { retiredAt: new Date() },
  });
};
