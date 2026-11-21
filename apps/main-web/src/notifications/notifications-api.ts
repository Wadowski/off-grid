// SPDX-FileCopyrightText: 2026 Dominik Wadowski
// SPDX-License-Identifier: FSL-1.1-ALv2

import { webNotificationsClient } from "../api/web-api-client.js";
import type { NotificationListOptions } from "@offgrid/api-client";

export const listNotifications = (options: NotificationListOptions) =>
  webNotificationsClient.list(options);

export const markNotificationRead = (notificationId: string): Promise<void> =>
  webNotificationsClient.markRead(notificationId);

export const markAllNotificationsRead = () => webNotificationsClient.markAllRead();
