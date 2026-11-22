// SPDX-FileCopyrightText: 2026 Dominik Wadowski
// SPDX-License-Identifier: FSL-1.1-ALv2

import type { DayGroup, NotificationsLayout } from "../../../../notifications/types.js";
import type {
  NotificationItem,
  NotificationsInbox,
} from "../../../../notifications/inbox-store/types.js";

export type NotificationsBodyProps = {
  readonly layout: NotificationsLayout;
  readonly inbox: NotificationsInbox;
  readonly groups: readonly DayGroup<NotificationItem>[];
  readonly onOpen: (notice: NotificationItem) => Promise<void>;
};
