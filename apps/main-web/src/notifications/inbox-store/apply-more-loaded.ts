// SPDX-FileCopyrightText: 2026 Dominik Wadowski
// SPDX-License-Identifier: FSL-1.1-ALv2

import { addUnseenItems } from "./add-unseen-items.js";
import type { InboxState, NotificationPage } from "./types.js";

export const applyMoreLoaded = (state: InboxState, page: NotificationPage): InboxState => ({
  ...state,
  items: [...state.items, ...addUnseenItems(state.items, page.notifications)],
  nextCursor: page.nextCursor,
  status: "ready",
  errorKind: state.errorKind === "loadMore" ? undefined : state.errorKind,
});
