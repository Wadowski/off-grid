// SPDX-FileCopyrightText: 2026 Dominik Wadowski
// SPDX-License-Identifier: FSL-1.1-ALv2

import type { InboxFilters, InboxState } from "./types.js";

export const applyFiltersChanged = (state: InboxState, filters: InboxFilters): InboxState => ({
  ...state,
  filters,
  items: [],
  nextCursor: null,
  status: "loading",
});
