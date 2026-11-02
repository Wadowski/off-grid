// SPDX-FileCopyrightText: 2026 Dominik Wadowski
// SPDX-License-Identifier: FSL-1.1-ALv2

import { createAccountRequestSchema } from "@offgrid/contracts";
import { sendValidationFailed } from "@offgrid/http";
import type { FastifyInstance } from "fastify";
import { registerAccount } from "../application/register-account.js";
import { SIGN_UP_RATE_LIMIT_PER_MINUTE, SIGN_UP_RATE_WINDOW_MS } from "../constants.js";
import type { IdentityRouteContext } from "../types.js";
import { refreshCookieHeader } from "./refresh-cookie-header.js";
import { sendRegistrationError } from "./send-registration-error.js";

export const registerCreateAccount = (
  api: FastifyInstance,
  context: IdentityRouteContext,
): void => {
  api.post(
    "/auth/register",
    {
      config: {
        rateLimit: { max: SIGN_UP_RATE_LIMIT_PER_MINUTE, timeWindow: SIGN_UP_RATE_WINDOW_MS },
      },
    },
    async (request, reply) => {
      const body = createAccountRequestSchema.safeParse(request.body);
      if (!body.success) {
        return sendValidationFailed(reply, body.error);
      }
      try {
        const account = await registerAccount(context.db, body.data);
        reply.header(
          "set-cookie",
          refreshCookieHeader(
            account.refreshToken,
            account.sessionExpiresAt,
            request.protocol === "https",
          ),
        );
        reply.header("cache-control", "no-store");
        return reply.code(201).send({
          user: {
            id: account.user.id,
            email: account.user.email,
            displayName: account.user.displayName,
            instanceRole: account.user.instanceRole,
          },
          recoveryCode: account.recoveryCode,
        });
      } catch (error) {
        return sendRegistrationError(reply, error);
      }
    },
  );
};
