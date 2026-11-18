// SPDX-FileCopyrightText: 2026 Dominik Wadowski
// SPDX-License-Identifier: FSL-1.1-ALv2

import { NOTIFICATION_TYPES } from "@offgrid/contracts";
import type { NotificationCategory, NotificationType } from "@offgrid/contracts";
import { NOTIFICATION_CATEGORY_BY_TYPE } from "../../constants.js";

export const typesInCategory = (category: NotificationCategory): NotificationType[] =>
  NOTIFICATION_TYPES.filter((type) => NOTIFICATION_CATEGORY_BY_TYPE[type] === category);
