// SPDX-FileCopyrightText: 2026 Dominik Wadowski
// SPDX-License-Identifier: FSL-1.1-ALv2

import { authRoutes, passwordRecoveryRequestSchema } from "@offgrid/contracts";
import { sendValidationFailed } from "@offgrid/http";
import type { FastifyInstance } from "fastify";
import { recoverWithRecoveryCode } from "../../application/password-recovery/recover-with-recovery-code.js";
import { PASSWORD_RECOVERY_RATE_LIMIT_PER_MINUTE, RATE_WINDOW_MS } from "../../constants.js";
import type { IdentityRouteContext } from "../../types.js";
import { sendPasswordRecoveryError } from "./send-password-recovery-error.js";

export const registerPasswordRecovery = (
  api: FastifyInstance,
  context: IdentityRouteContext,
): void => {
  api.post(
    authRoutes.passwordRecovery,
    {
      config: {
        rateLimit: { max: PASSWORD_RECOVERY_RATE_LIMIT_PER_MINUTE, timeWindow: RATE_WINDOW_MS },
      },
    },
    async (request, reply) => {
      const body = passwordRecoveryRequestSchema.safeParse(request.body);
      if (!body.success) {
        return sendValidationFailed(reply, body.error);
      }
      try {
        const { recoveryCode } = await recoverWithRecoveryCode(context.db, body.data);
        context.logger.info("password recovered with recovery code", {
          action: "password-recovery.completed",
        });
        reply.header("cache-control", "no-store");
        return reply.code(200).send({ recoveryCode });
      } catch (error) {
        return sendPasswordRecoveryError(reply, error);
      }
    },
  );
};
