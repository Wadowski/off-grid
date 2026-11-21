// SPDX-FileCopyrightText: 2026 Dominik Wadowski
// SPDX-License-Identifier: FSL-1.1-ALv2

import { isNewerThanPageHead } from "./is-newer-than-page-head.js";
import type { InboxState, NotificationPage } from "./types.js";

export const applyPageLoaded = (state: InboxState, page: NotificationPage): InboxState => {
  const pageIds = new Set(page.notifications.map((notification) => notification.id));
  const liveItemsAhead = state.items.filter(
    (item) => !pageIds.has(item.id) && isNewerThanPageHead(item, page),
  );
  return {
    ...state,
    items: [...liveItemsAhead, ...page.notifications],
    nextCursor: page.nextCursor,
    unreadCount: page.unreadCount,
    status: "ready",
    errorKind: undefined,
  };
};
