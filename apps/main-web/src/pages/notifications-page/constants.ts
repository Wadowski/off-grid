// SPDX-FileCopyrightText: 2026 Dominik Wadowski
// SPDX-License-Identifier: FSL-1.1-ALv2

import type { NotificationFilterOptionDefinition } from "./types.js";

export const NOTIFICATION_FILTER_OPTIONS: readonly NotificationFilterOptionDefinition[] = [
  { id: "all", labelId: "notifications.filters.all", filters: { unread: false } },
  { id: "unread", labelId: "notifications.filters.unread", filters: { unread: true } },
  {
    id: "calendar",
    labelId: "notifications.filters.calendar",
    filters: { category: "calendar", unread: false },
  },
  {
    id: "account-security",
    labelId: "notifications.filters.account-security",
    filters: { category: "account-security", unread: false },
  },
];
