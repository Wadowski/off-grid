// SPDX-FileCopyrightText: 2026 Dominik Wadowski
// SPDX-License-Identifier: FSL-1.1-ALv2

import type { FastifyInstance } from "fastify";
import type { IdentityResolver, ServerRuntime } from "../types.js";
import { resolveTraceId, runWithTrace } from "@offgrid/observability";
import { routeOf } from "./route-of.js";

export const registerRequestHooks = (
  app: FastifyInstance,
  identity: IdentityResolver,
  runtime: ServerRuntime,
): void => {
  app.addHook("onRequest", (request, reply, done) => {
    const traceId = resolveTraceId(request.headers["x-trace-id"]);
    reply.header("x-trace-id", traceId);
    runWithTrace(traceId, () => done());
  });
  app.addHook("onRequest", async (request) => {
    request.requestContext = await identity(request);
  });
  app.addHook("onResponse", async (request, reply) => {
    runtime.logger.info("request completed", {
      method: request.method,
      route: routeOf(request),
      status_code: reply.statusCode,
      duration_ms: Math.round(reply.elapsedTime),
    });
  });
};
