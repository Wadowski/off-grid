// SPDX-FileCopyrightText: 2026 Dominik Wadowski
// SPDX-License-Identifier: FSL-1.1-ALv2

import { accountRoutes } from "@offgrid/contracts";
import { sendUnauthenticated, withUser } from "@offgrid/http";
import type { FastifyInstance } from "fastify";
import { listOwnSessions } from "../../application/sessions/list-own-sessions.js";
import type { IdentityRouteContext } from "../../types.js";

export const registerListSessions = (api: FastifyInstance, context: IdentityRouteContext): void => {
  api.get(
    accountRoutes.sessions,
    withUser(context.currentUserId, async (request, reply, userId) => {
      const currentSessionId = context.currentSessionId(request);
      if (currentSessionId === null) {
        return sendUnauthenticated(reply);
      }
      return reply.send({ sessions: await listOwnSessions(context.db, userId, currentSessionId) });
    }),
  );
};
