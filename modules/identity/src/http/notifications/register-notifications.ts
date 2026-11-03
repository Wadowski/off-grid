// SPDX-FileCopyrightText: 2026 Dominik Wadowski
// SPDX-License-Identifier: FSL-1.1-ALv2

import { accountRoutes, uuidSchema } from "@offgrid/contracts";
import { sendNotFound, sendValidationFailed, withUser } from "@offgrid/http";
import type { FastifyInstance } from "fastify";
import { z } from "zod";
import { listOwnNotifications } from "../../application/notifications/list-own-notifications.js";
import { markOwnNotificationRead } from "../../application/notifications/mark-own-notification-read.js";
import { NotificationNotFoundError } from "../../application/errors/notification-not-found-error.js";
import type { IdentityRouteContext } from "../../types.js";

const notificationParamsSchema = z.object({ notificationId: uuidSchema });

export const registerNotifications = (
  api: FastifyInstance,
  context: IdentityRouteContext,
): void => {
  api.get(
    accountRoutes.notifications,
    withUser(context.currentUserId, async (_request, reply, userId) => {
      return reply.send(await listOwnNotifications(context.db, userId));
    }),
  );

  api.post(
    accountRoutes.notificationRead,
    withUser(context.currentUserId, async (request, reply, userId) => {
      const params = notificationParamsSchema.safeParse(request.params);
      if (!params.success) {
        return sendValidationFailed(reply, params.error);
      }
      try {
        await markOwnNotificationRead(context.db, userId, params.data.notificationId);
        return reply.code(204).send();
      } catch (error) {
        if (error instanceof NotificationNotFoundError) {
          return sendNotFound(reply);
        }
        throw error;
      }
    }),
  );
};
