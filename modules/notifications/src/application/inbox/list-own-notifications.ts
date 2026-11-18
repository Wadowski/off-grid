// SPDX-FileCopyrightText: 2026 Dominik Wadowski
// SPDX-License-Identifier: FSL-1.1-ALv2

import { withUserContext, type ModuleDatabase } from "@offgrid/db";
import type { NotificationList, NotificationPageRequest } from "../../types.js";
import { readInboxPage } from "./read-inbox-page.js";
import { toListedNotification } from "./to-listed-notification.js";

export const listOwnNotifications = async (
  db: ModuleDatabase,
  userId: string,
  request: NotificationPageRequest,
): Promise<NotificationList> => {
  const page = await db.$transaction(async (tx) => {
    await withUserContext(tx, userId);
    return readInboxPage(tx, userId, request);
  });
  return {
    notifications: page.records.map(toListedNotification),
    unreadCount: page.unreadCount,
    nextCursor: page.nextCursor,
    total: page.total,
  };
};
