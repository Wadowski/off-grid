// SPDX-FileCopyrightText: 2026 Dominik Wadowski
// SPDX-License-Identifier: FSL-1.1-ALv2

import type { ModuleDatabase } from "@offgrid/db";
import type { Logger } from "@offgrid/observability";
import { deliverToChannels } from "../application/channels/deliver-to-channels.js";
import { writeInboxNotification } from "../application/inbox/write-inbox-notification.js";
import type { InboxNotice, NotificationChannel } from "../types.js";

export const handleFactNotice = async (
  db: ModuleDatabase,
  channels: readonly NotificationChannel[],
  logger: Logger,
  notice: InboxNotice,
  occurredAt: Date,
): Promise<void> => {
  await writeInboxNotification(db, notice, occurredAt);
  await deliverToChannels(channels, notice, logger);
};
