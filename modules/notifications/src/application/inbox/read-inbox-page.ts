// SPDX-FileCopyrightText: 2026 Dominik Wadowski
// SPDX-License-Identifier: FSL-1.1-ALv2

import type { ModuleTransaction } from "@offgrid/db";
import { countOwnNotifications } from "../../infrastructure/inbox/count-own-notifications.js";
import { countOwnUnreadNotifications } from "../../infrastructure/inbox/count-own-unread-notifications.js";
import { findOwnNotifications } from "../../infrastructure/inbox/find-own-notifications.js";
import type { NotificationPageRequest } from "../../types.js";
import { buildNotificationFilter } from "./build-notification-filter.js";
import { buildNotificationPage } from "./build-notification-page.js";
import { decodeNotificationCursor } from "./decode-notification-cursor.js";

export const readInboxPage = async (
  tx: ModuleTransaction,
  userId: string,
  request: NotificationPageRequest,
) => {
  const after = request.cursor === undefined ? null : decodeNotificationCursor(request.cursor);
  const filter = buildNotificationFilter(request);
  const records = await findOwnNotifications(tx, userId, request.limit, after, filter);
  const total = await countOwnNotifications(tx, userId, filter);
  const unreadCount = await countOwnUnreadNotifications(tx, userId);
  return { ...buildNotificationPage(records, request.limit), total, unreadCount };
};
