// SPDX-FileCopyrightText: 2026 Dominik Wadowski
// SPDX-License-Identifier: FSL-1.1-ALv2

import type { NotificationItem } from "./types.js";

export const addUnseenItems = (
  existing: readonly NotificationItem[],
  incoming: readonly NotificationItem[],
): readonly NotificationItem[] => {
  const seenIds = new Set(existing.map((item) => item.id));
  return incoming.filter((item) => !seenIds.has(item.id));
};
