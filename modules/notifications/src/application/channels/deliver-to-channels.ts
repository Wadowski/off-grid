// SPDX-FileCopyrightText: 2026 Dominik Wadowski
// SPDX-License-Identifier: FSL-1.1-ALv2

import type { Logger } from "@offgrid/observability";
import type { InboxNotice, NotificationChannel } from "../../types.js";

export const deliverToChannels = async (
  channels: readonly NotificationChannel[],
  notice: InboxNotice,
  logger: Logger,
): Promise<void> => {
  const results = await Promise.allSettled(channels.map((channel) => channel.deliver(notice)));
  results.forEach((result, index) => {
    if (result.status === "rejected") {
      logger.warn("notification channel failed", {
        channel: channels[index]?.name,
        error: result.reason instanceof Error ? result.reason.name : "UnknownError",
      });
    }
  });
};
