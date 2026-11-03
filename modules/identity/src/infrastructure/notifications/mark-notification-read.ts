// SPDX-FileCopyrightText: 2026 Dominik Wadowski
// SPDX-License-Identifier: FSL-1.1-ALv2

import type { ModuleTransaction } from "@offgrid/db";

// Returns false when the item is not the user's. An item that is already read keeps
// its first read time.
export const markNotificationRead = async (
  tx: ModuleTransaction,
  userId: string,
  notificationId: string,
  readAt: Date,
): Promise<boolean> => {
  const owned = await tx.notification.count({ where: { notificationId, userId } });
  if (owned === 0) {
    return false;
  }
  await tx.notification.updateMany({
    where: { notificationId, userId, readAt: null },
    data: { readAt },
  });
  return true;
};
