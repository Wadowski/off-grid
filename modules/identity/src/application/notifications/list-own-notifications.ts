// SPDX-FileCopyrightText: 2026 Dominik Wadowski
// SPDX-License-Identifier: FSL-1.1-ALv2

import { withUserContext, type ModuleDatabase } from "@offgrid/db";
import { findOwnNotifications } from "../../infrastructure/notifications/find-own-notifications.js";
import type { ListedNotification, NotificationList } from "../../types.js";

export const listOwnNotifications = async (
  db: ModuleDatabase,
  userId: string,
): Promise<NotificationList> => {
  const records = await db.$transaction(async (tx) => {
    await withUserContext(tx, userId);
    return findOwnNotifications(tx, userId);
  });
  const notifications: ListedNotification[] = records.map((record) => ({
    id: record.notificationId,
    type: record.type,
    data: record.data,
    createdAt: record.createdAt.toISOString(),
    readAt: record.readAt === null ? null : record.readAt.toISOString(),
  }));
  return {
    notifications,
    unreadCount: notifications.filter((notification) => notification.readAt === null).length,
  };
};
