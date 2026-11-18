// SPDX-FileCopyrightText: 2026 Dominik Wadowski
// SPDX-License-Identifier: FSL-1.1-ALv2

import { accountRoutes, notificationListQuerySchema } from "@offgrid/contracts";
import { sendValidationFailed, withUser } from "@offgrid/http";
import type { FastifyInstance } from "fastify";
import { listOwnNotifications } from "../application/inbox/list-own-notifications.js";
import type { NotificationRouteContext } from "../types.js";
import { sendNotificationCursorError } from "./send-notification-cursor-error.js";

export const registerListNotifications = (
  api: FastifyInstance,
  context: NotificationRouteContext,
): void => {
  api.get(
    accountRoutes.notifications,
    withUser(context.currentUserId, async (request, reply, userId) => {
      const query = notificationListQuerySchema.safeParse(request.query);
      if (!query.success) {
        return sendValidationFailed(reply, query.error);
      }
      try {
        return reply.send(await listOwnNotifications(context.db, userId, query.data));
      } catch (error) {
        return sendNotificationCursorError(reply, error);
      }
    }),
  );
};
