// SPDX-FileCopyrightText: 2026 Dominik Wadowski
// SPDX-License-Identifier: FSL-1.1-ALv2

import type { ModuleTransaction } from "@offgrid/db";
import type { InboxNotice } from "../../types.js";

export const insertInboxNotification = async (
  tx: ModuleTransaction,
  notice: InboxNotice,
  createdAt: Date,
): Promise<void> => {
  await tx.notificationItem.createMany({
    data: [
      {
        notificationId: notice.notificationId,
        userId: notice.userId,
        type: notice.type,
        data: notice.data,
        createdAt,
      },
    ],
    skipDuplicates: true,
  });
};
