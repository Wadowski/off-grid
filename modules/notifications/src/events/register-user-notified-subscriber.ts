// SPDX-FileCopyrightText: 2026 Dominik Wadowski
// SPDX-License-Identifier: FSL-1.1-ALv2

import { userNotifiedV1 } from "@offgrid/contracts";
import { INBOX_SUBSCRIBER_NAME, NOTIFICATIONS_MODULE_NAME } from "../constants.js";
import { handleUserNotified } from "./handle-user-notified.js";
import type { NotificationChannel, NotificationsModuleContext } from "../types.js";

export const registerUserNotifiedSubscriber = (
  context: NotificationsModuleContext,
  channels: readonly NotificationChannel[],
): void => {
  context.eventBus.subscribe({
    name: INBOX_SUBSCRIBER_NAME,
    event: userNotifiedV1,
    runAs: NOTIFICATIONS_MODULE_NAME,
    handler: async (event) =>
      handleUserNotified(
        context.db,
        channels,
        context.logger,
        {
          notificationId: event.payload.notificationId,
          userId: event.payload.userId,
          type: event.payload.type,
          data: event.payload.data,
        },
        new Date(event.occurredAt),
      ),
  });
};
