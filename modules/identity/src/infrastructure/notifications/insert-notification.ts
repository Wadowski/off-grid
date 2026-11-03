// SPDX-FileCopyrightText: 2026 Dominik Wadowski
// SPDX-License-Identifier: FSL-1.1-ALv2

import type { ModuleTransaction } from "@offgrid/db";
import type { NewNotification } from "../../types.js";

export const insertNotification = async (
  tx: ModuleTransaction,
  notification: NewNotification,
  createdAt: Date,
): Promise<void> => {
  await tx.notification.create({
    data: {
      notificationId: notification.id,
      userId: notification.userId,
      type: notification.type,
      data: notification.data,
      createdAt,
    },
  });
};
