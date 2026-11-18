// SPDX-FileCopyrightText: 2026 Dominik Wadowski
// SPDX-License-Identifier: FSL-1.1-ALv2

import type { NotificationFilter } from "../../types.js";

export const notificationFilterWhere = (filter: NotificationFilter) => ({
  type: filter.types === undefined ? undefined : { in: [...filter.types] },
  readAt: filter.unreadOnly ? null : undefined,
});
