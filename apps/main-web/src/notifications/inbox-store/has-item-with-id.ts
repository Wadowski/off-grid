// SPDX-FileCopyrightText: 2026 Dominik Wadowski
// SPDX-License-Identifier: FSL-1.1-ALv2

import type { NotificationItem } from "./types.js";

export const hasItemWithId = (
  items: readonly NotificationItem[],
  notificationId: string,
): boolean => items.some((item) => item.id === notificationId);
