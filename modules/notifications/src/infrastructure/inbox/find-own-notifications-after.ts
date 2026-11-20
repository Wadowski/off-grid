// SPDX-FileCopyrightText: 2026 Dominik Wadowski
// SPDX-License-Identifier: FSL-1.1-ALv2

import type { ModuleTransaction } from "@offgrid/db";
import type { NotificationCursor, NotificationRecord } from "../../types.js";
import { toNotificationRecord } from "./to-notification-record.js";

export const findOwnNotificationsAfter = async (
  tx: ModuleTransaction,
  userId: string,
  cursor: NotificationCursor,
  limit: number,
): Promise<NotificationRecord[]> => {
  const rows = await tx.notificationItem.findMany({
    where: {
      userId,
      OR: [
        { createdAt: { gt: cursor.createdAt } },
        { createdAt: cursor.createdAt, notificationId: { gt: cursor.notificationId } },
      ],
    },
    orderBy: [{ createdAt: "asc" }, { notificationId: "asc" }],
    take: limit,
  });
  return rows.map(toNotificationRecord);
};
