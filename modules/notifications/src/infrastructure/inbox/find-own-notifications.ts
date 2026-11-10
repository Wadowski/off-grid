// SPDX-FileCopyrightText: 2026 Dominik Wadowski
// SPDX-License-Identifier: FSL-1.1-ALv2

import { notificationDataSchema } from "@offgrid/contracts";
import type { ModuleTransaction } from "@offgrid/db";
import type { NotificationRecord } from "../../types.js";

export const findOwnNotifications = async (
  tx: ModuleTransaction,
  userId: string,
): Promise<NotificationRecord[]> => {
  const rows = await tx.notificationItem.findMany({
    where: { userId },
    orderBy: { createdAt: "desc" },
  });
  return rows.map((row) => ({
    notificationId: row.notificationId,
    type: row.type,
    data: notificationDataSchema.parse(row.data),
    createdAt: row.createdAt,
    readAt: row.readAt,
  }));
};
