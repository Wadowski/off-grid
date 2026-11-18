// SPDX-FileCopyrightText: 2026 Dominik Wadowski
// SPDX-License-Identifier: FSL-1.1-ALv2

import type { ModuleTransaction } from "@offgrid/db";

export const countOwnUnreadNotifications = (
  tx: ModuleTransaction,
  userId: string,
): Promise<number> => tx.notificationItem.count({ where: { userId, readAt: null } });
