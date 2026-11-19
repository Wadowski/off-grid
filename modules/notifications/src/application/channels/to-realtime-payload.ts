// SPDX-FileCopyrightText: 2026 Dominik Wadowski
// SPDX-License-Identifier: FSL-1.1-ALv2

import { notificationTypeSchema } from "@offgrid/contracts";
import { toListedNotification } from "../inbox/to-listed-notification.js";
import type { InboxNotice, ListedNotification } from "../../types.js";

export const toRealtimePayload = (notice: InboxNotice): ListedNotification =>
  toListedNotification({
    notificationId: notice.notificationId,
    type: notificationTypeSchema.parse(notice.type),
    data: notice.data,
    createdAt: notice.createdAt,
    readAt: null,
  });
