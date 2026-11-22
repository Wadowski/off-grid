// SPDX-FileCopyrightText: 2026 Dominik Wadowski
// SPDX-License-Identifier: FSL-1.1-ALv2

import { INITIAL_INBOX_FILTERS } from "./inbox-store/constants.js";
import type { InboxFilters } from "./inbox-store/types.js";
import { NOTIFICATION_FILTER_OPTIONS } from "./constants.js";
import type { NotificationFilterOption } from "./types.js";

export const filterForOption = (option: NotificationFilterOption): InboxFilters =>
  NOTIFICATION_FILTER_OPTIONS.find((definition) => definition.id === option)?.filters ??
  INITIAL_INBOX_FILTERS;
