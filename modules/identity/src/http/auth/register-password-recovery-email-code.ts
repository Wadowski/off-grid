// SPDX-FileCopyrightText: 2026 Dominik Wadowski
// SPDX-License-Identifier: FSL-1.1-ALv2

import { authRoutes, emailCodeRequestSchema } from "@offgrid/contracts";
import { sendValidationFailed } from "@offgrid/http";
import type { FastifyInstance } from "fastify";
import { requestEmailCode } from "../../application/password-recovery/request-email-code.js";
import { EMAIL_CODE_RATE_LIMIT_PER_MINUTE, RATE_WINDOW_MS } from "../../constants.js";
import type { IdentityRouteContext } from "../../types.js";
import { sendPasswordRecoveryError } from "./send-password-recovery-error.js";

export const registerPasswordRecoveryEmailCode = (
  api: FastifyInstance,
  context: IdentityRouteContext,
): void => {
  api.post(
    authRoutes.passwordRecoveryEmailCode,
    {
      config: {
        rateLimit: { max: EMAIL_CODE_RATE_LIMIT_PER_MINUTE, timeWindow: RATE_WINDOW_MS },
      },
    },
    async (request, reply) => {
      const body = emailCodeRequestSchema.safeParse(request.body);
      if (!body.success) {
        return sendValidationFailed(reply, body.error);
      }
      try {
        await requestEmailCode(context.emailDependencies, body.data);
        return reply.code(202).send();
      } catch (error) {
        return sendPasswordRecoveryError(reply, error);
      }
    },
  );
};
