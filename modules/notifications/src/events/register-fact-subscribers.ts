// SPDX-FileCopyrightText: 2026 Dominik Wadowski
// SPDX-License-Identifier: FSL-1.1-ALv2

import { FACT_NOTICES, INBOX_SUBSCRIBER_PREFIX, NOTIFICATIONS_MODULE_NAME } from "../constants.js";
import { handleFactNotice } from "./handle-fact-notice.js";
import type { NotificationChannel, NotificationsModuleContext } from "../types.js";

export const registerFactSubscribers = (
  context: NotificationsModuleContext,
  channels: readonly NotificationChannel[],
): void => {
  for (const { event, noticeType, recipientKey, dataKeys } of FACT_NOTICES) {
    context.eventBus.subscribe({
      name: `${INBOX_SUBSCRIBER_PREFIX}-${event.name}`,
      event,
      runAs: NOTIFICATIONS_MODULE_NAME,
      handler: async (received) =>
        handleFactNotice(
          context.db,
          channels,
          context.logger,
          {
            notificationId: received.id,
            userId: payloadField(received.payload, recipientKey),
            type: noticeType,
            data: Object.fromEntries(
              dataKeys.map((key) => [key, payloadField(received.payload, key)]),
            ),
          },
          new Date(received.occurredAt),
        ),
    });
  }
};

const payloadField = (payload: object, key: string): string => {
  const value = (payload as Record<string, unknown>)[key];
  if (typeof value !== "string") {
    throw new Error(`fact payload has no string field "${key}"`);
  }
  return value;
};
