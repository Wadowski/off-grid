// SPDX-FileCopyrightText: 2026 Dominik Wadowski
// SPDX-License-Identifier: FSL-1.1-ALv2

import { withUserContext, type ModuleDatabase } from "@offgrid/db";
import { MAX_REPLAY_NOTICES } from "../../constants.js";
import { findOwnNotificationCursor } from "../../infrastructure/inbox/find-own-notification-cursor.js";
import { findOwnNotificationsAfter } from "../../infrastructure/inbox/find-own-notifications-after.js";
import type { MissedNotifications, NotificationRecord } from "../../types.js";
import { toListedNotification } from "./to-listed-notification.js";

export const readMissedNotifications = async (
  db: ModuleDatabase,
  userId: string,
  lastNoticeId: string,
): Promise<MissedNotifications> => {
  const newerRecords: NotificationRecord[] | null = await db.$transaction(async (tx) => {
    await withUserContext(tx, userId);
    const cursor = await findOwnNotificationCursor(tx, userId, lastNoticeId);
    return cursor === null
      ? null
      : findOwnNotificationsAfter(tx, userId, cursor, MAX_REPLAY_NOTICES + 1);
  });
  if (newerRecords === null || newerRecords.length > MAX_REPLAY_NOTICES) {
    return { kind: "reset" };
  }
  return { kind: "replay", notices: newerRecords.map(toListedNotification) };
};
