// SPDX-FileCopyrightText: 2026 Dominik Wadowski
// SPDX-License-Identifier: FSL-1.1-ALv2

import type { ParseKeys } from "i18next";
import type { InboxFilters } from "../../notifications/inbox-store/types.js";

export type NotificationFilterOption = "all" | "unread" | "calendar" | "account-security";

export type NotificationFilterOptionDefinition = {
  readonly id: NotificationFilterOption;
  readonly labelId: ParseKeys;
  readonly filters: InboxFilters;
};
