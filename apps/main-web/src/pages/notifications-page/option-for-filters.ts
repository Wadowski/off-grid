// SPDX-FileCopyrightText: 2026 Dominik Wadowski
// SPDX-License-Identifier: FSL-1.1-ALv2

import type { InboxFilters } from "../../notifications/inbox-store/types.js";
import type { NotificationFilterOption } from "./types.js";

export const optionForFilters = (filters: InboxFilters): NotificationFilterOption => {
  if (filters.category === "calendar") {
    return "calendar";
  }
  if (filters.category === "account-security") {
    return "account-security";
  }
  return filters.unread === true ? "unread" : "all";
};
