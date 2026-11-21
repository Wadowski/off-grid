// SPDX-FileCopyrightText: 2026 Dominik Wadowski
// SPDX-License-Identifier: FSL-1.1-ALv2

import type { ModuleTransaction } from "@offgrid/db";
import type { NotificationCursor } from "../../types.js";

export const findOwnNotificationCursor = async (
  tx: ModuleTransaction,
  userId: string,
  notificationId: string,
): Promise<NotificationCursor | null> => {
  const row = await tx.notificationItem.findFirst({
    where: { notificationId, userId },
    select: { notificationId: true, createdAt: true },
  });
  return row === null ? null : { createdAt: row.createdAt, notificationId: row.notificationId };
};
