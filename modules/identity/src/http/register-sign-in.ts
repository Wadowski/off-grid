// SPDX-FileCopyrightText: 2026 Dominik Wadowski
// SPDX-License-Identifier: FSL-1.1-ALv2

import { authRoutes, signInRequestSchema } from "@offgrid/contracts";
import { sendValidationFailed } from "@offgrid/http";
import type { FastifyInstance } from "fastify";
import { signIn } from "../application/sign-in.js";
import { RATE_WINDOW_MS, SIGN_IN_RATE_LIMIT_PER_MINUTE } from "../constants.js";
import type { IdentityRouteContext } from "../types.js";
import { refreshCookieHeader } from "./refresh-cookie-header.js";
import { sendSessionError } from "./send-session-error.js";

export const registerSignIn = (api: FastifyInstance, context: IdentityRouteContext): void => {
  api.post(
    authRoutes.signIn,
    {
      config: {
        rateLimit: { max: SIGN_IN_RATE_LIMIT_PER_MINUTE, timeWindow: RATE_WINDOW_MS },
      },
    },
    async (request, reply) => {
      const body = signInRequestSchema.safeParse(request.body);
      if (!body.success) {
        return sendValidationFailed(reply, body.error);
      }
      try {
        const session = await signIn(context.db, body.data);
        reply.header(
          "set-cookie",
          refreshCookieHeader(
            session.refreshToken,
            session.sessionExpiresAt,
            request.protocol === "https",
          ),
        );
        reply.header("cache-control", "no-store");
        return reply.code(200).send({
          user: session.user,
          accessToken: session.accessToken,
          accessExpiresAt: session.accessExpiresAt.toISOString(),
        });
      } catch (error) {
        return sendSessionError(reply, error);
      }
    },
  );
};
