// SPDX-FileCopyrightText: 2026 Dominik Wadowski
// SPDX-License-Identifier: FSL-1.1-ALv2

import type { FastifyError, FastifyInstance } from "fastify";
import type { Logger } from "@offgrid/observability";
import { statusOf } from "./status-of.js";

export const registerErrorHandling = (app: FastifyInstance, logger: Logger): void => {
  app.setErrorHandler(async (error: FastifyError, request, reply) => {
    const status = statusOf(error);
    if (status >= 500) {
      logger.error("request failed", { route: request.routeOptions.url ?? "unmatched", status });
      return reply.code(500).send({ error: "internal_error" });
    }
    return reply.code(status).send({ error: "invalid_request" });
  });
  app.setNotFoundHandler(async (_request, reply) => reply.code(404).send({ error: "not_found" }));
};
