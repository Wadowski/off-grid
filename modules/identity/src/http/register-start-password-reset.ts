// SPDX-FileCopyrightText: 2026 Dominik Wadowski
// SPDX-License-Identifier: FSL-1.1-ALv2

import { adminRoutes } from "@offgrid/contracts";
import { sendValidationFailed, withUser } from "@offgrid/http";
import type { FastifyInstance } from "fastify";
import { startPasswordReset } from "../application/start-password-reset.js";
import type { IdentityRouteContext } from "../types.js";
import { sendAdminError } from "./send-admin-error.js";
import { userParamsSchema } from "./user-params-schema.js";

export const registerStartPasswordReset = (
  api: FastifyInstance,
  context: IdentityRouteContext,
): void => {
  api.post(
    adminRoutes.resetPassword,
    withUser(context.currentUserId, async (request, reply, actorUserId) => {
      const params = userParamsSchema.safeParse(request.params);
      if (!params.success) {
        return sendValidationFailed(reply, params.error);
      }
      try {
        const issued = await startPasswordReset(context.db, actorUserId, params.data.userId);
        context.logger.info("instance admin started a password reset", {
          action: "password-reset.started",
          actorUserId,
          targetUserId: issued.userId,
        });
        reply.header("cache-control", "no-store");
        return reply.code(201).send({
          userId: issued.userId,
          code: issued.code,
          expiresAt: issued.expiresAt.toISOString(),
        });
      } catch (error) {
        return sendAdminError(reply, error);
      }
    }),
  );
};
