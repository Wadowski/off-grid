// SPDX-FileCopyrightText: 2026 Dominik Wadowski
// SPDX-License-Identifier: FSL-1.1-ALv2

import type { NotificationCursor } from "../../types.js";

export const encodeNotificationCursor = (cursor: NotificationCursor): string =>
  Buffer.from(
    JSON.stringify({ c: cursor.createdAt.toISOString(), i: cursor.notificationId }),
    "utf8",
  ).toString("base64url");
