// SPDX-FileCopyrightText: 2026 Dominik Wadowski
// SPDX-License-Identifier: FSL-1.1-ALv2

import type { FastifyInstance } from "fastify";
import { NOTIFICATIONS_MODULE_NAME, SUBSCRIBER_QUEUE_LIMIT } from "./constants.js";
import { registerNotificationRoutes } from "./http/register-notification-routes.js";
import { registerFactSubscribers } from "./events/register-fact-subscribers.js";
import { createNotificationHubProvider } from "./realtime/create-notification-hub-provider.js";
import { createRealtimeWorker } from "./realtime/create-realtime-worker.js";
import type {
  NotificationsModuleContext,
  NotificationsModuleOptions,
  NotificationsWorker,
  NotificationsWorkerContext,
} from "./types.js";

export const createNotificationsModule = (options: NotificationsModuleOptions = {}) => {
  const provideRealtimeHub = createNotificationHubProvider(SUBSCRIBER_QUEUE_LIMIT);
  return {
    name: NOTIFICATIONS_MODULE_NAME,
    registerRoutes: (api: FastifyInstance, context: NotificationsModuleContext): void => {
      registerNotificationRoutes(api, { db: context.db, currentUserId: context.currentUserId });
    },
    registerSubscribers: (context: NotificationsModuleContext): void => {
      registerFactSubscribers(context, options.channels ?? []);
    },
    workers: (context: NotificationsWorkerContext): readonly NotificationsWorker[] => [
      createRealtimeWorker(provideRealtimeHub(context.logger)),
    ],
  };
};
