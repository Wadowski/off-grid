// SPDX-FileCopyrightText: 2026 Dominik Wadowski
// SPDX-License-Identifier: FSL-1.1-ALv2

import type { FastifyInstance } from "fastify";
import { NOTIFICATIONS_MODULE_NAME } from "./constants.js";
import { registerNotificationRoutes } from "./http/register-notification-routes.js";
import { registerUserNotifiedSubscriber } from "./events/register-user-notified-subscriber.js";
import type { NotificationsModuleContext, NotificationsModuleOptions } from "./types.js";

export const createNotificationsModule = (options: NotificationsModuleOptions = {}) => ({
  name: NOTIFICATIONS_MODULE_NAME,
  registerRoutes: (api: FastifyInstance, context: NotificationsModuleContext): void => {
    registerNotificationRoutes(api, { db: context.db, currentUserId: context.currentUserId });
  },
  registerSubscribers: (context: NotificationsModuleContext): void => {
    registerUserNotifiedSubscriber(context, options.channels ?? []);
  },
});
