// SPDX-FileCopyrightText: 2026 Dominik Wadowski
// SPDX-License-Identifier: FSL-1.1-ALv2

import { accountRoutes, passwordConfirmationRequestSchema } from "@offgrid/contracts";
import { sendValidationFailed, withUser } from "@offgrid/http";
import type { FastifyInstance } from "fastify";
import { ACCOUNT_SECRET_RATE_LIMIT_PER_MINUTE, RATE_WINDOW_MS } from "../../constants.js";
import { regenerateOwnRecoveryCode } from "../../application/account/regenerate-own-recovery-code.js";
import type { IdentityRouteContext } from "../../types.js";
import { deliverToChannels } from "../../application/notifications/deliver-to-channels.js";
import { sendAccountError } from "./send-account-error.js";

export const registerRecoveryCode = (api: FastifyInstance, context: IdentityRouteContext): void => {
  api.post(
    accountRoutes.recoveryCode,
    {
      config: {
        rateLimit: { max: ACCOUNT_SECRET_RATE_LIMIT_PER_MINUTE, timeWindow: RATE_WINDOW_MS },
      },
    },
    withUser(context.currentUserId, async (request, reply, userId) => {
      const body = passwordConfirmationRequestSchema.safeParse(request.body);
      if (!body.success) {
        return sendValidationFailed(reply, body.error);
      }
      try {
        const { recoveryCode, notification } = await regenerateOwnRecoveryCode(
          context.db,
          userId,
          body.data.password,
        );
        await deliverToChannels(context.notificationChannels, notification, context.logger);
        reply.header("cache-control", "no-store");
        return reply.code(201).send({ recoveryCode });
      } catch (error) {
        return sendAccountError(reply, error);
      }
    }),
  );
};
