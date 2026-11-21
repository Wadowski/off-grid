// SPDX-FileCopyrightText: 2026 Dominik Wadowski
// SPDX-License-Identifier: FSL-1.1-ALv2

import type { InboxState } from "./types.js";

export const markAllReadOptimistic = (state: InboxState, readAt: string): InboxState => ({
  ...state,
  items: state.items.map((item) => ({ ...item, readAt: item.readAt ?? readAt })),
  unreadCount: 0,
});
