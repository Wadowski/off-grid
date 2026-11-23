// SPDX-FileCopyrightText: 2026 Dominik Wadowski
// SPDX-License-Identifier: FSL-1.1-ALv2

import type {
  NotificationItem,
  NotificationsInbox,
} from "../../../../../../../../notifications/index.js";

export type NotificationsSurfaceListProps = {
  readonly inbox: NotificationsInbox;
  readonly onOpen: (notice: NotificationItem) => Promise<void>;
  readonly limit?: number;
};
