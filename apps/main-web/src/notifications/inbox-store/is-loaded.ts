// SPDX-FileCopyrightText: 2026 Dominik Wadowski
// SPDX-License-Identifier: FSL-1.1-ALv2

import type { InboxState, NotificationItem } from "./types.js";

export const isLoaded = (state: InboxState, notification: NotificationItem): boolean =>
  state.items.some((item) => item.id === notification.id);
