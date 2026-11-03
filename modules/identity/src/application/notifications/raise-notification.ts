// SPDX-FileCopyrightText: 2026 Dominik Wadowski
// SPDX-License-Identifier: FSL-1.1-ALv2

import { randomUUID } from "node:crypto";
import type { ModuleTransaction } from "@offgrid/db";
import { insertNotification } from "../../infrastructure/notifications/insert-notification.js";
import { publishUserNotified } from "../../events/publish-user-notified.js";
import type { NewNotification, NotificationInput } from "../../types.js";

export const raiseNotification = async (
  tx: ModuleTransaction,
  input: NotificationInput,
  now: Date = new Date(),
): Promise<NewNotification> => {
  const notification: NewNotification = {
    id: randomUUID(),
    userId: input.userId,
    type: input.type,
    data: {},
  };
  await insertNotification(tx, notification, now);
  await publishUserNotified(tx, notification, now);
  return notification;
};
