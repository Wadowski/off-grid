// SPDX-FileCopyrightText: 2026 Dominik Wadowski
// SPDX-License-Identifier: FSL-1.1-ALv2

import { accountRoutes } from "@offgrid/contracts";
import { sendUnauthenticated, withUser } from "@offgrid/http";
import type { FastifyInstance } from "fastify";
import { endOtherOwnSessions } from "../../application/sessions/end-other-own-sessions.js";
import type { IdentityRouteContext } from "../../types.js";

export const registerEndOtherSessions = (
  api: FastifyInstance,
  context: IdentityRouteContext,
): void => {
  api.post(
    accountRoutes.otherSessions,
    withUser(context.currentUserId, async (request, reply, userId) => {
      const currentSessionId = context.currentSessionId(request);
      if (currentSessionId === null) {
        return sendUnauthenticated(reply);
      }
      await endOtherOwnSessions(context.db, userId, currentSessionId);
      return reply.code(204).send();
    }),
  );
};
