// SPDX-FileCopyrightText: 2026 Dominik Wadowski
// SPDX-License-Identifier: FSL-1.1-ALv2

import type { ModuleTransaction } from "@offgrid/db";
import type { NotificationFilter } from "../../types.js";
import { notificationFilterWhere } from "./notification-filter-where.js";

export const countOwnNotifications = (
  tx: ModuleTransaction,
  userId: string,
  filter: NotificationFilter,
): Promise<number> =>
  tx.notificationItem.count({ where: { userId, ...notificationFilterWhere(filter) } });
