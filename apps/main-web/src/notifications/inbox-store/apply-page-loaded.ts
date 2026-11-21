// SPDX-FileCopyrightText: 2026 Dominik Wadowski
// SPDX-License-Identifier: FSL-1.1-ALv2

import { hasItemWithId } from "./has-item-with-id.js";
import { isNewerThanPageHead } from "./is-newer-than-page-head.js";
import type { InboxState, NotificationPage } from "./types.js";

export const applyPageLoaded = (state: InboxState, page: NotificationPage): InboxState => {
  const liveItemsAhead = state.items.filter(
    (item) => !hasItemWithId(page.notifications, item.id) && isNewerThanPageHead(item, page),
  );
  return {
    ...state,
    items: [...liveItemsAhead, ...page.notifications],
    nextCursor: page.nextCursor,
    unreadCount: page.unreadCount,
    total: page.total,
    status: "ready",
    errorKind: undefined,
  };
};
