// SPDX-FileCopyrightText: 2026 Dominik Wadowski
// SPDX-License-Identifier: FSL-1.1-ALv2

import { authRoutes } from "@offgrid/contracts";
import { sendError } from "@offgrid/http";
import type { FastifyInstance } from "fastify";
import { signOut } from "../application/sign-out.js";
import { RATE_WINDOW_MS, SIGN_OUT_RATE_LIMIT_PER_MINUTE } from "../constants.js";
import { clearRefreshCookieHeader } from "../infrastructure/clear-refresh-cookie-header.js";
import { readRefreshTokenFromCookie } from "../infrastructure/read-refresh-token-from-cookie.js";
import type { IdentityRouteContext } from "../types.js";
import { hasClientRequestHeader } from "./has-client-request-header.js";

export const registerSignOut = (api: FastifyInstance, context: IdentityRouteContext): void => {
  api.post(
    authRoutes.signOut,
    {
      config: {
        rateLimit: { max: SIGN_OUT_RATE_LIMIT_PER_MINUTE, timeWindow: RATE_WINDOW_MS },
      },
    },
    async (request, reply) => {
      if (!hasClientRequestHeader(request.headers)) {
        return sendError(reply, 403, "CLIENT_REQUEST_HEADER_MISSING", "Missing request header");
      }
      const refreshToken = readRefreshTokenFromCookie(request.headers.cookie);
      if (refreshToken !== null) {
        await signOut(context.db, refreshToken);
      }
      reply.header("set-cookie", clearRefreshCookieHeader(request.protocol === "https"));
      reply.header("cache-control", "no-store");
      return reply.code(204).send();
    },
  );
};
