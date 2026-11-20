// SPDX-FileCopyrightText: 2026 Dominik Wadowski
// SPDX-License-Identifier: FSL-1.1-ALv2

import { accountRoutes } from "@offgrid/contracts";
import { sendUnauthenticated, withUser } from "@offgrid/http";
import type { FastifyInstance } from "fastify";
import type { NotificationRouteContext } from "../types.js";
import { openNotificationStream } from "./stream/open-notification-stream.js";

export const registerStreamNotifications = (
  api: FastifyInstance,
  context: NotificationRouteContext,
): void => {
  api.addHook("preClose", async () => {
    context.hub.close();
  });
  api.get(
    accountRoutes.notificationsStream,
    withUser(context.currentUserId, async (request, reply, userId) => {
      const session = await context.verifySession(request);
      if (session === null || session.userId !== userId) {
        return sendUnauthenticated(reply);
      }
      return openNotificationStream(request, reply, {
        hub: context.hub,
        verifySession: context.verifySession,
        logger: context.logger,
        userId,
        accessExpiresAt: session.accessExpiresAt,
        heartbeatMs: context.streamHeartbeatMs,
      });
    }),
  );
};
