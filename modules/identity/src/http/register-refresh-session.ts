// SPDX-FileCopyrightText: 2026 Dominik Wadowski
// SPDX-License-Identifier: FSL-1.1-ALv2

import { authRoutes } from "@offgrid/contracts";
import { sendError } from "@offgrid/http";
import type { FastifyInstance } from "fastify";
import { renewSession } from "../application/renew-session.js";
import { RATE_WINDOW_MS, REFRESH_RATE_LIMIT_PER_MINUTE } from "../constants.js";
import type { IdentityRouteContext } from "../types.js";
import { hasClientRequestHeader } from "./has-client-request-header.js";
import { readRefreshTokenFromCookie } from "../infrastructure/read-refresh-token-from-cookie.js";
import { refreshCookieHeader } from "./refresh-cookie-header.js";
import { sendSessionError } from "./send-session-error.js";
import { SessionEndedError } from "../application/session-ended-error.js";

export const registerRefreshSession = (
  api: FastifyInstance,
  context: IdentityRouteContext,
): void => {
  api.post(
    authRoutes.refresh,
    {
      config: {
        rateLimit: { max: REFRESH_RATE_LIMIT_PER_MINUTE, timeWindow: RATE_WINDOW_MS },
      },
    },
    async (request, reply) => {
      if (!hasClientRequestHeader(request.headers)) {
        return sendError(reply, 403, "CLIENT_REQUEST_HEADER_MISSING", "Missing request header");
      }
      try {
        const refreshToken = readRefreshTokenFromCookie(request.headers.cookie);
        if (refreshToken === null) {
          throw new SessionEndedError();
        }
        const renewed = await renewSession(context.db, refreshToken);
        if (renewed.refreshToken !== null) {
          reply.header(
            "set-cookie",
            refreshCookieHeader(
              renewed.refreshToken,
              renewed.sessionExpiresAt,
              request.protocol === "https",
            ),
          );
        }
        reply.header("cache-control", "no-store");
        return reply.code(200).send({
          accessToken: renewed.accessToken,
          accessExpiresAt: renewed.accessExpiresAt.toISOString(),
        });
      } catch (error) {
        return sendSessionError(reply, error);
      }
    },
  );
};
