// SPDX-FileCopyrightText: 2026 Dominik Wadowski
// SPDX-License-Identifier: FSL-1.1-ALv2

import type { FastifyInstance } from "fastify";
import type { ServerRuntime } from "../types.js";
import { statusOf } from "./errors/status-of.js";
import { routeOf } from "./route-of.js";
import { errorBodyFor } from "./errors/error-body-for.js";
import { notFoundBody } from "./errors/not-found-body.js";

export const registerErrorHandling = (app: FastifyInstance, runtime: ServerRuntime): void => {
  app.setErrorHandler((error, request, reply) => {
    const status = statusOf(error);
    if (status >= 500) {
      runtime.errorSink.record(error, { route: routeOf(request) });
      runtime.logger.error("request failed", { route: routeOf(request) });
    }
    reply.code(status).send(errorBodyFor(error, status));
  });
  app.setNotFoundHandler((_request, reply) => {
    reply.code(404).send(notFoundBody());
  });
};
