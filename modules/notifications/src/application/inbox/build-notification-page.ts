// SPDX-FileCopyrightText: 2026 Dominik Wadowski
// SPDX-License-Identifier: FSL-1.1-ALv2

import type { NotificationRecord } from "../../types.js";
import { encodeNotificationCursor } from "./encode-notification-cursor.js";

export const buildNotificationPage = (
  records: NotificationRecord[],
  limit: number,
): { readonly records: NotificationRecord[]; readonly nextCursor: string | null } => {
  const pageRecords = records.slice(0, limit);
  const lastRecord = pageRecords.at(-1);
  const hasMore = records.length > limit && lastRecord !== undefined;
  return {
    records: pageRecords,
    nextCursor: hasMore
      ? encodeNotificationCursor({
          createdAt: lastRecord.createdAt,
          notificationId: lastRecord.notificationId,
        })
      : null,
  };
};
