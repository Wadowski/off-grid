// SPDX-FileCopyrightText: 2026 Dominik Wadowski
// SPDX-License-Identifier: FSL-1.1-ALv2

import type { NotificationsInbox, NotificationItem } from "../../../../../../../../notifications/inbox-store/types.js";

export type NotificationsModalListProps = {
  readonly inbox: NotificationsInbox;
  readonly onOpen: (notice: NotificationItem) => Promise<void>;
};
