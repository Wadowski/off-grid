// SPDX-FileCopyrightText: 2026 Dominik Wadowski
// SPDX-License-Identifier: FSL-1.1-ALv2

import { NOTIFICATION_EVENT_NAME, RESET_COMMENT } from "./constants.js";
import { handleNotificationFrame } from "./handle-notification-frame.js";
import type { NotificationStreamHandlers, SseFrame } from "./types.js";

export const handleStreamFrame = (
  frame: SseFrame,
  lastId: string | undefined,
  handlers: NotificationStreamHandlers,
): string | undefined => {
  let currentId = lastId;
  if (frame.comments.includes(RESET_COMMENT)) {
    handlers.onReset();
    currentId = undefined;
  }
  if (frame.event === NOTIFICATION_EVENT_NAME && frame.data !== undefined) {
    return handleNotificationFrame(frame.data, currentId, handlers);
  }
  return currentId;
};
