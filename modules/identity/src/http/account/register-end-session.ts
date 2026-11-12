// SPDX-FileCopyrightText: 2026 Dominik Wadowski
// SPDX-License-Identifier: FSL-1.1-ALv2

import { accountRoutes, uuidSchema } from "@offgrid/contracts";
import { sendValidationFailed, withUser } from "@offgrid/http";
import type { FastifyInstance } from "fastify";
import { z } from "zod";
import { endOwnSession } from "../../application/sessions/end-own-session.js";
import type { IdentityRouteContext } from "../../types.js";
import { sendAccountError } from "./send-account-error.js";

const sessionParamsSchema = z.object({ sessionId: uuidSchema });

export const registerEndSession = (api: FastifyInstance, context: IdentityRouteContext): void => {
  api.delete(
    accountRoutes.session,
    withUser(context.currentUserId, async (request, reply, userId) => {
      const params = sessionParamsSchema.safeParse(request.params);
      if (!params.success) {
        return sendValidationFailed(reply, params.error);
      }
      try {
        await endOwnSession(context.db, userId, params.data.sessionId);
        return reply.code(204).send();
      } catch (error) {
        return sendAccountError(reply, error);
      }
    }),
  );
};
