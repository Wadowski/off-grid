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
  return {
    ...state,
    items: matchesFilters(state.filters, notification)
      ? [notification, ...state.items]
      : state.items,
    unreadCount: isUnread ? state.unreadCount + 1 : state.unreadCount,
  };
};
