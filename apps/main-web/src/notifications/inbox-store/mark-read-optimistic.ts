// SPDX-FileCopyrightText: 2026 Dominik Wadowski
// SPDX-License-Identifier: FSL-1.1-ALv2

import { updateItem } from "./update-item.js";
import type { InboxState } from "./types.js";

export const markReadOptimistic = (
  state: InboxState,
  notificationId: string,
  readAt: string,
): InboxState => {
  const target = state.items.find((item) => item.id === notificationId);
  if (target === undefined || target.readAt !== null) {
    return state;
  }
  return {
    ...state,
    items: updateItem(state.items, notificationId, (item) => ({ ...item, readAt })),
    unreadCount: Math.max(0, state.unreadCount - 1),
  };
};
