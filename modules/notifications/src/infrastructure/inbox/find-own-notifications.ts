// SPDX-FileCopyrightText: 2026 Dominik Wadowski
// SPDX-License-Identifier: FSL-1.1-ALv2

import { notificationDataSchema, notificationTypeSchema } from "@offgrid/contracts";
import type { ModuleTransaction } from "@offgrid/db";
import type { NotificationCursor, NotificationFilter, NotificationRecord } from "../../types.js";
import { afterCursorFilter } from "./after-cursor-filter.js";
import { notificationFilterWhere } from "./notification-filter-where.js";

export const findOwnNotifications = async (
  tx: ModuleTransaction,
  userId: string,
  limit: number,
  after: NotificationCursor | null,
  filter: NotificationFilter,
): Promise<NotificationRecord[]> => {
  const rows = await tx.notificationItem.findMany({
    where: { userId, ...notificationFilterWhere(filter), OR: afterCursorFilter(after) },
    orderBy: [{ createdAt: "desc" }, { notificationId: "desc" }],
    take: limit + 1,
  });
  return rows.map((row) => ({
    notificationId: row.notificationId,
    type: notificationTypeSchema.parse(row.type),
    data: notificationDataSchema.parse(row.data),
    createdAt: row.createdAt,
    readAt: row.readAt,
  }));
};
