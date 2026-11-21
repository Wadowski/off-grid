// SPDX-FileCopyrightText: 2026 Dominik Wadowski
// SPDX-License-Identifier: FSL-1.1-ALv2

import { INBOX_PAGE_SIZE } from "./constants.js";
import type { InboxFilters } from "./types.js";
import type { NotificationListOptions } from "@offgrid/api-client";

export const toListOptions = (filters: InboxFilters): NotificationListOptions => ({
  limit: INBOX_PAGE_SIZE,
  ...(filters.category === undefined ? {} : { category: filters.category }),
  ...(filters.unread === true ? { unread: "true" as const } : {}),
});
