// SPDX-FileCopyrightText: 2026 Dominik Wadowski
// SPDX-License-Identifier: FSL-1.1-ALv2

import type { FastifyInstance } from "fastify";
import type { NotificationRouteContext } from "../types.js";
import { registerListNotifications } from "./register-list-notifications.js";
import { registerMarkNotificationRead } from "./register-mark-notification-read.js";

export const registerNotificationRoutes = (
  api: FastifyInstance,
  context: NotificationRouteContext,
): void => {
  registerListNotifications(api, context);
  registerMarkNotificationRead(api, context);
};
