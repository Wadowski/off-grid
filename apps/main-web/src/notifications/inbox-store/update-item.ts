// SPDX-FileCopyrightText: 2026 Dominik Wadowski
// SPDX-License-Identifier: FSL-1.1-ALv2

import type { NotificationItem } from "./types.js";

export const updateItem = (
  items: readonly NotificationItem[],
  notificationId: string,
  update: (item: NotificationItem) => NotificationItem,
): readonly NotificationItem[] =>
  items.map((item) => (item.id === notificationId ? update(item) : item));
