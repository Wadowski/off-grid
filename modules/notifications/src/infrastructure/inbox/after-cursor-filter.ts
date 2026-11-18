// SPDX-FileCopyrightText: 2026 Dominik Wadowski
// SPDX-License-Identifier: FSL-1.1-ALv2

import type { NotificationCursor } from "../../types.js";

export const afterCursorFilter = (cursor: NotificationCursor | null) =>
  cursor === null
    ? undefined
    : [
        { createdAt: { lt: cursor.createdAt } },
        { createdAt: cursor.createdAt, notificationId: { lt: cursor.notificationId } },
      ];
