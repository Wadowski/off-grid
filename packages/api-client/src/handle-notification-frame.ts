// SPDX-FileCopyrightText: 2026 Dominik Wadowski
// SPDX-License-Identifier: FSL-1.1-ALv2

import { INVALID_FRAME_MESSAGE } from "./constants.js";
import { parseNotificationData } from "./parse-notification-data.js";
import type { NotificationStreamHandlers } from "./types.js";

export const handleNotificationFrame = (
  data: string,
  lastId: string | undefined,
  handlers: NotificationStreamHandlers,
): string | undefined => {
  const notification = parseNotificationData(data);
  if (notification === undefined) {
    handlers.onError(new Error(INVALID_FRAME_MESSAGE));
    return lastId;
  }
  handlers.onNotification(notification);
  return notification.id;
};
