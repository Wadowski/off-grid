// SPDX-FileCopyrightText: 2026 Dominik Wadowski
// SPDX-License-Identifier: FSL-1.1-ALv2

import { withUserContext, type ModuleDatabase } from "@offgrid/db";
import { insertInboxNotification } from "../../infrastructure/inbox/insert-inbox-notification.js";
import type { InboxNotice } from "../../types.js";

export const writeInboxNotification = (
  db: ModuleDatabase,
  notice: InboxNotice,
  createdAt: Date,
): Promise<void> =>
  db.$transaction(async (tx) => {
    await withUserContext(tx, notice.userId);
    await insertInboxNotification(tx, notice, createdAt);
  });
