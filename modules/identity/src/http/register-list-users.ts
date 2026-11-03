// SPDX-FileCopyrightText: 2026 Dominik Wadowski
// SPDX-License-Identifier: FSL-1.1-ALv2

import { adminRoutes } from "@offgrid/contracts";
import { withUser } from "@offgrid/http";
import type { FastifyInstance } from "fastify";
import { listUsers } from "../application/list-users.js";
import type { IdentityRouteContext } from "../types.js";
import { sendAdminError } from "./send-admin-error.js";

export const registerListUsers = (api: FastifyInstance, context: IdentityRouteContext): void => {
  api.get(
    adminRoutes.users,
    withUser(context.currentUserId, async (_request, reply, actorUserId) => {
      try {
        const users = await listUsers(context.db, actorUserId);
        return reply.code(200).send({ users });
      } catch (error) {
        return sendAdminError(reply, error);
      }
    }),
  );
};
