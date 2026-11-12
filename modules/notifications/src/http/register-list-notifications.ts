// SPDX-FileCopyrightText: 2026 Dominik Wadowski
// SPDX-License-Identifier: FSL-1.1-ALv2

import { accountRoutes } from "@offgrid/contracts";
import { withUser } from "@offgrid/http";
import type { FastifyInstance } from "fastify";
import { listOwnNotifications } from "../application/inbox/list-own-notifications.js";
import type { NotificationRouteContext } from "../types.js";

export const registerListNotifications = (
  api: FastifyInstance,
  context: NotificationRouteContext,
): void => {
  api.get(
    accountRoutes.notifications,
    withUser(context.currentUserId, async (_request, reply, userId) => {
      return reply.send(await listOwnNotifications(context.db, userId));
    }),
  );
};
