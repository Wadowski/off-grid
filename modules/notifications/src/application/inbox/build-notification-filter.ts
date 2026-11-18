// SPDX-FileCopyrightText: 2026 Dominik Wadowski
// SPDX-License-Identifier: FSL-1.1-ALv2

import { typesInCategory } from "../../domain/notification-category/types-in-category.js";
import type { NotificationFilter, NotificationPageRequest } from "../../types.js";

export const buildNotificationFilter = (request: NotificationPageRequest): NotificationFilter => ({
  types: request.category === undefined ? undefined : typesInCategory(request.category),
  unreadOnly: request.unread === "true",
});
