// SPDX-FileCopyrightText: 2026 Dominik Wadowski
// SPDX-License-Identifier: FSL-1.1-ALv2

import type { FastifyInstance } from "fastify";
import type { Logger } from "@offgrid/observability";

export const registerRequestLogging = (app: FastifyInstance, logger: Logger): void => {
  app.addHook("onResponse", async (request, reply) => {
    logger.info("request completed", {
      method: request.method,
      route: request.routeOptions.url ?? "unmatched",
      status: reply.statusCode,
      durationMs: Math.round(reply.elapsedTime),
    });
  });
};
