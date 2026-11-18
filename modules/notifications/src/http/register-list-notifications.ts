// SPDX-FileCopyrightText: 2026 Dominik Wadowski
// SPDX-License-Identifier: FSL-1.1-ALv2

import { accountRoutes, notificationListQuerySchema } from "@offgrid/contracts";
import { sendError, sendValidationFailed, withUser } from "@offgrid/http";
import type { FastifyInstance } from "fastify";
import { listOwnNotifications } from "../application/inbox/list-own-notifications.js";
import { InvalidNotificationCursorError } from "../application/errors/invalid-notification-cursor-error.js";
import type { NotificationRouteContext } from "../types.js";

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
        if (error instanceof InvalidNotificationCursorError) {
          return sendError(reply, 400, "VALIDATION_FAILED", "cursor is invalid");
        }
        throw error;
      }
    }),
  );
};
