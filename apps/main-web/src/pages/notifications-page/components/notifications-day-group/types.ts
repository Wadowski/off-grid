// SPDX-FileCopyrightText: 2026 Dominik Wadowski
// SPDX-License-Identifier: FSL-1.1-ALv2

import type { DayGroup } from "../../../../notifications/types.js";
import type { NotificationItem } from "../../../../notifications/inbox-store/types.js";

export type NotificationsDayGroupProps = {
  readonly group: DayGroup<NotificationItem>;
  readonly onOpen: (notice: NotificationItem) => Promise<void>;
  readonly onMarkRead: (notificationId: string) => Promise<void>;
};
