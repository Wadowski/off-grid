// SPDX-FileCopyrightText: 2026 Dominik Wadowski
// SPDX-License-Identifier: FSL-1.1-ALv2

import { withUserContext, type ModuleDatabase } from "@offgrid/db";
import { markAllNotificationsRead } from "../../infrastructure/inbox/mark-all-notifications-read.js";

export const markAllOwnNotificationsRead = (
  db: ModuleDatabase,
  userId: string,
  now: Date = new Date(),
): Promise<{ updated: number }> =>
  db.$transaction(async (tx) => {
    await withUserContext(tx, userId);
    const updated = await markAllNotificationsRead(tx, userId, now);
    return { updated };
  });
