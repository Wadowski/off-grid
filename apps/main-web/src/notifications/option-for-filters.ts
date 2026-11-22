// SPDX-FileCopyrightText: 2026 Dominik Wadowski
// SPDX-License-Identifier: FSL-1.1-ALv2

import type { InboxFilters } from "../../notifications/inbox-store/types.js";
import { NOTIFICATION_FILTER_OPTIONS } from "./constants.js";
import type { NotificationFilterOption } from "./types.js";

export const optionForFilters = (filters: InboxFilters): NotificationFilterOption =>
  NOTIFICATION_FILTER_OPTIONS.find(
    (definition) =>
      definition.filters.category === filters.category &&
      definition.filters.unread === filters.unread,
  )?.id ?? "all";
