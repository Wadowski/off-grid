// SPDX-FileCopyrightText: 2026 Dominik Wadowski
// SPDX-License-Identifier: FSL-1.1-ALv2

import type { Logger } from "@offgrid/observability";
import type { NewNotification } from "../../types.js";
import type { NotificationChannel } from "./notification-channel.js";

// Never throws: a failing channel is logged by name and the others still run, so a
// channel failure cannot undo or block the change that raised the notification.
export const deliverToChannels = async (
  channels: readonly NotificationChannel[],
  notification: NewNotification,
  logger: Logger,
): Promise<void> => {
  const results = await Promise.allSettled(
    channels.map((channel) => channel.deliver(notification)),
  );
  results.forEach((result, index) => {
    if (result.status === "rejected") {
      logger.warn("notification channel failed", {
        channel: channels[index]?.name,
        error: result.reason instanceof Error ? result.reason.name : "UnknownError",
      });
    }
  });
};
