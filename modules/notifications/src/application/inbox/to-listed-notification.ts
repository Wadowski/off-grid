// SPDX-FileCopyrightText: 2026 Dominik Wadowski
// SPDX-License-Identifier: FSL-1.1-ALv2

import { NOTIFICATION_CATEGORY_BY_TYPE } from "../../constants.js";
import type { ListedNotification, NotificationRecord } from "../../types.js";

export const toListedNotification = (record: NotificationRecord): ListedNotification => ({
  id: record.notificationId,
  type: record.type,
  category: NOTIFICATION_CATEGORY_BY_TYPE[record.type],
  data: record.data,
  createdAt: record.createdAt.toISOString(),
  readAt: record.readAt === null ? null : record.readAt.toISOString(),
});
