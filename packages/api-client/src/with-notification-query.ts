// SPDX-FileCopyrightText: 2026 Dominik Wadowski
// SPDX-License-Identifier: FSL-1.1-ALv2

import type { NotificationListOptions } from "./types.js";

export const withNotificationQuery = (path: string, options: NotificationListOptions): string => {
  const params = new URLSearchParams();
  if (options.cursor !== undefined) {
    params.set("cursor", options.cursor);
  }
  if (options.limit !== undefined) {
    params.set("limit", String(options.limit));
  }
  if (options.category !== undefined) {
    params.set("category", options.category);
  }
  if (options.unread !== undefined) {
    params.set("unread", options.unread);
  }
  const query = params.toString();
  return query.length === 0 ? path : `${path}?${query}`;
};
