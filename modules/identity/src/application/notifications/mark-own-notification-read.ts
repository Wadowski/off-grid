// SPDX-FileCopyrightText: 2026 Dominik Wadowski
// SPDX-License-Identifier: FSL-1.1-ALv2

import { withUserContext, type ModuleDatabase } from "@offgrid/db";
import { markNotificationRead } from "../../infrastructure/notifications/mark-notification-read.js";
import { NotificationNotFoundError } from "../errors/notification-not-found-error.js";

export const markOwnNotificationRead = (
  db: ModuleDatabase,
  userId: string,
  notificationId: string,
  now: Date = new Date(),
): Promise<void> =>
  db.$transaction(async (tx) => {
    await withUserContext(tx, userId);
    if (!(await markNotificationRead(tx, userId, notificationId, now))) {
      throw new NotificationNotFoundError();
    }
  });
