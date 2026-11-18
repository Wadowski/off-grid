// SPDX-FileCopyrightText: 2026 Dominik Wadowski
// SPDX-License-Identifier: FSL-1.1-ALv2

import type { ModuleTransaction } from "@offgrid/db";

export const markAllNotificationsRead = async (
  tx: ModuleTransaction,
  userId: string,
  readAt: Date,
): Promise<number> => {
  const result = await tx.notificationItem.updateMany({
    where: { userId, readAt: null },
    data: { readAt },
  });
  return result.count;
};
