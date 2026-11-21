// SPDX-FileCopyrightText: 2026 Dominik Wadowski
// SPDX-License-Identifier: FSL-1.1-ALv2

import { updateItem } from "./update-item.js";
import type { InboxState } from "./types.js";

export const revertRead = (
  state: InboxState,
  notificationId: string,
  previousReadAt: string | null,
): InboxState => {
  const target = state.items.find((item) => item.id === notificationId);
  const wasOptimisticallyRead = previousReadAt === null && target?.readAt !== null;
  return {
    ...state,
    items: updateItem(state.items, notificationId, (item) => ({ ...item, readAt: previousReadAt })),
    unreadCount:
      target !== undefined && wasOptimisticallyRead ? state.unreadCount + 1 : state.unreadCount,
    errorKind: "markRead",
  };
};
