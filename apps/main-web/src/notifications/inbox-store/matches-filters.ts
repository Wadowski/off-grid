// SPDX-FileCopyrightText: 2026 Dominik Wadowski
// SPDX-License-Identifier: FSL-1.1-ALv2

import type { InboxFilters, NotificationItem } from "./types.js";

export const matchesFilters = (filters: InboxFilters, notification: NotificationItem): boolean =>
  (filters.category === undefined || notification.category === filters.category) &&
  (filters.unread !== true || notification.readAt === null);
