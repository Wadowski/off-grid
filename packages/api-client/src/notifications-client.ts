// SPDX-FileCopyrightText: 2026 Dominik Wadowski
// SPDX-License-Identifier: FSL-1.1-ALv2

import {
  accountRoutes,
  notificationListSchema,
  notificationMarkAllReadSchema,
} from "@offgrid/contracts";
import { fillRoute } from "./fill-route.js";
import { withNotificationQuery } from "./with-notification-query.js";
import type { ApiClient, NotificationListOptions } from "./types.js";

export const createNotificationsClient = (client: ApiClient) => ({
  list: async (options: NotificationListOptions = {}) =>
    notificationListSchema.parse(
      await client.request("GET", withNotificationQuery(accountRoutes.notifications, options)),
    ),

  markRead: async (notificationId: string): Promise<void> => {
    await client.request("POST", fillRoute(accountRoutes.notificationRead, { notificationId }));
  },

  markAllRead: async () =>
    notificationMarkAllReadSchema.parse(
      await client.request("POST", accountRoutes.notificationsReadAll),
    ),
});
