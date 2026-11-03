// SPDX-FileCopyrightText: 2026 Dominik Wadowski
// SPDX-License-Identifier: FSL-1.1-ALv2

import { accountRoutes, changePasswordRequestSchema } from "@offgrid/contracts";
import { sendUnauthenticated, sendValidationFailed, withUser } from "@offgrid/http";
import type { FastifyInstance } from "fastify";
import { ACCOUNT_SECRET_RATE_LIMIT_PER_MINUTE, RATE_WINDOW_MS } from "../../constants.js";
import { changeOwnPassword } from "../../application/account/change-own-password.js";
import { deliverToChannels } from "../../application/notifications/deliver-to-channels.js";
import { externalNotificationChannels } from "../../application/notifications/external-channels.js";
import type { IdentityRouteContext } from "../../types.js";
import { sendAccountError } from "./send-account-error.js";

export const registerChangePassword = (
  api: FastifyInstance,
  context: IdentityRouteContext,
): void => {
  api.post(
    accountRoutes.password,
    {
      config: {
        rateLimit: { max: ACCOUNT_SECRET_RATE_LIMIT_PER_MINUTE, timeWindow: RATE_WINDOW_MS },
      },
    },
    withUser(context.currentUserId, async (request, reply, userId) => {
      const body = changePasswordRequestSchema.safeParse(request.body);
      if (!body.success) {
        return sendValidationFailed(reply, body.error);
      }
      const currentSessionId = context.currentSessionId(request);
      if (currentSessionId === null) {
        return sendUnauthenticated(reply);
      }
      try {
        const notification = await changeOwnPassword(context.db, userId, currentSessionId, {
          currentPassword: body.data.currentPassword,
          newPassword: body.data.newPassword,
        });
        await deliverToChannels(externalNotificationChannels, notification, context.logger);
        return reply.code(204).send();
      } catch (error) {
        return sendAccountError(reply, error);
      }
    }),
  );
};
