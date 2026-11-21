// SPDX-FileCopyrightText: 2026 Dominik Wadowski
// SPDX-License-Identifier: FSL-1.1-ALv2

import { hasItemWithId } from "./has-item-with-id.js";
import type { NotificationItem } from "./types.js";

export const addUnseenItems = (
  existing: readonly NotificationItem[],
  incoming: readonly NotificationItem[],
): readonly NotificationItem[] => incoming.filter((item) => !hasItemWithId(existing, item.id));
