// SPDX-FileCopyrightText: 2026 Dominik Wadowski
// SPDX-License-Identifier: FSL-1.1-ALv2

import type { NotificationFilterOptionDefinition } from "./types.js";

export const MINUTE_MS = 60_000;
export const HOUR_MS = 60 * MINUTE_MS;
export const DAY_MS = 24 * HOUR_MS;
export const BELL_COUNT_CAP = 99;

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
