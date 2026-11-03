// SPDX-FileCopyrightText: 2026 Dominik Wadowski
// SPDX-License-Identifier: FSL-1.1-ALv2

import type { ModuleTransaction } from "@offgrid/db";
import type { NotificationRecord } from "../../types.js";

export const findOwnNotifications = async (
  tx: ModuleTransaction,
  userId: string,
): Promise<NotificationRecord[]> => {
  const rows = await tx.notification.findMany({
    where: { userId },
    orderBy: { createdAt: "desc" },
  });
  return rows.map((row) => ({
    notificationId: row.notificationId,
    type: row.type,
    data: row.data as Record<string, string>,
    createdAt: row.createdAt,
    readAt: row.readAt,
  }));
};
