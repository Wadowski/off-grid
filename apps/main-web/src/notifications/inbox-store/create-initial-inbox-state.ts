// SPDX-FileCopyrightText: 2026 Dominik Wadowski
// SPDX-License-Identifier: FSL-1.1-ALv2

import type { InboxFilters, InboxState } from "./types.js";

export const createInitialInboxState = (filters: InboxFilters): InboxState => ({
  items: [],
  filters,
  nextCursor: null,
  unreadCount: 0,
  total: 0,
  status: "loading",
  errorKind: undefined,
});
