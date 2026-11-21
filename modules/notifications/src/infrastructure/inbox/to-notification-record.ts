// SPDX-FileCopyrightText: 2026 Dominik Wadowski
// SPDX-License-Identifier: FSL-1.1-ALv2

import { notificationDataSchema, notificationTypeSchema } from "@offgrid/contracts";
import type { NotificationItemRow, NotificationRecord } from "../../types.js";

export const toNotificationRecord = (row: NotificationItemRow): NotificationRecord => ({
  notificationId: row.notificationId,
  type: notificationTypeSchema.parse(row.type),
  data: notificationDataSchema.parse(row.data),
  createdAt: row.createdAt,
  readAt: row.readAt,
});
