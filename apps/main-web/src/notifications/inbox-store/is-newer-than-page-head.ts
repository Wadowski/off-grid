// SPDX-FileCopyrightText: 2026 Dominik Wadowski
// SPDX-License-Identifier: FSL-1.1-ALv2

import type { NotificationItem, NotificationPage } from "./types.js";

export const isNewerThanPageHead = (item: NotificationItem, page: NotificationPage): boolean => {
  const [head] = page.notifications;
  return head === undefined || Date.parse(item.createdAt) > Date.parse(head.createdAt);
};
