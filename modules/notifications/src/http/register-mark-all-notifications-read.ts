// SPDX-FileCopyrightText: 2026 Dominik Wadowski
// SPDX-License-Identifier: FSL-1.1-ALv2

import { accountRoutes } from "@offgrid/contracts";
import { withUser } from "@offgrid/http";
import type { FastifyInstance } from "fastify";
import { markAllOwnNotificationsRead } from "../application/inbox/mark-all-own-notifications-read.js";
import type { NotificationRouteContext } from "../types.js";

export const registerMarkAllNotificationsRead = (
  api: FastifyInstance,
  context: NotificationRouteContext,
): void => {
  api.post(
    accountRoutes.notificationsReadAll,
    withUser(context.currentUserId, async (_request, reply, userId) =>
      reply.code(200).send(await markAllOwnNotificationsRead(context.db, userId)),
    ),
  );
};
