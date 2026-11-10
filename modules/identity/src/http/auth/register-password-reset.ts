// SPDX-FileCopyrightText: 2026 Dominik Wadowski
// SPDX-License-Identifier: FSL-1.1-ALv2

import { authRoutes, passwordResetRequestSchema } from "@offgrid/contracts";
import { sendValidationFailed } from "@offgrid/http";
import type { FastifyInstance } from "fastify";
import { completePasswordReset } from "../../application/password-reset/complete-password-reset.js";
import { PASSWORD_RESET_RATE_LIMIT_PER_MINUTE, RATE_WINDOW_MS } from "../../constants.js";
import type { IdentityRouteContext } from "../../types.js";
import { sendPasswordResetError } from "./send-password-reset-error.js";

export const registerPasswordReset = (
  api: FastifyInstance,
  context: IdentityRouteContext,
): void => {
  api.post(
    authRoutes.passwordReset,
    {
      config: {
        rateLimit: { max: PASSWORD_RESET_RATE_LIMIT_PER_MINUTE, timeWindow: RATE_WINDOW_MS },
      },
    },
    async (request, reply) => {
      const body = passwordResetRequestSchema.safeParse(request.body);
      if (!body.success) {
        return sendValidationFailed(reply, body.error);
      }
      try {
        const { recoveryCode } = await completePasswordReset(context.db, body.data);
        context.logger.info("password reset completed", { action: "password-reset.completed" });
        reply.header("cache-control", "no-store");
        return reply.code(200).send({ recoveryCode });
      } catch (error) {
        return sendPasswordResetError(reply, error);
      }
    },
  );
};
