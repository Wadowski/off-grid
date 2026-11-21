// SPDX-FileCopyrightText: 2026 Dominik Wadowski
// SPDX-License-Identifier: FSL-1.1-ALv2

import { isLoaded } from "./is-loaded.js";
import { matchesFilters } from "./matches-filters.js";
import type { InboxState, NotificationItem } from "./types.js";

export const mergeLiveNotification = (
  state: InboxState,
  notification: NotificationItem,
): InboxState => {
  if (isLoaded(state, notification)) {
    return state;
  }
  const isUnread = notification.readAt === null;
  const isVisible = matchesFilters(state.filters, notification);
  return {
    ...state,
    items: isVisible ? [notification, ...state.items] : state.items,
    total: isVisible ? state.total + 1 : state.total,
    unreadCount: isUnread ? state.unreadCount + 1 : state.unreadCount,
  };
};
