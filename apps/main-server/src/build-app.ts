// SPDX-FileCopyrightText: 2026 Dominik Wadowski
// SPDX-License-Identifier: FSL-1.1-ALv2

import Fastify from "fastify";
import cors from "@fastify/cors";
import rateLimit from "@fastify/rate-limit";
import type { AppOptions } from "./types.js";
import type { FastifyInstance } from "fastify";
import { loadExpectedMigrations } from "./load-expected-migrations.js";
import { registerRequestHooks } from "./register-request-hooks.js";
import {
  CORS_ALLOWED_HEADERS,
  CORS_ALLOWED_METHODS,
  CORS_EXPOSED_HEADERS,
  RATE_WINDOW_MS,
} from "./constants.js";
import { registerErrorHandling } from "./register-error-handling.js";
import { registerApiRoutes } from "./register-api-routes.js";
import { anonymousContext } from "./anonymous-context.js";

export const buildApp = async ({
  config,
  runtime,
  modules,
  identity = anonymousContext,
  migrations,
}: AppOptions): Promise<FastifyInstance> => {
  const expectedMigrations = await loadExpectedMigrations(
    migrations ?? modules.flatMap((module) => module.migrations ?? []),
  );
  const app = Fastify({
    logger: false,
    trustProxy: config.trustedProxies.length > 0 ? [...config.trustedProxies] : false,
  });

  registerRequestHooks(app, identity, runtime);
  await app.register(rateLimit, {
    global: true,
    max: config.rateLimitPerMinute,
    timeWindow: RATE_WINDOW_MS,
  });
  await app.register(cors, {
    origin: [...config.corsOrigins],
    methods: CORS_ALLOWED_METHODS,
    allowedHeaders: CORS_ALLOWED_HEADERS,
    exposedHeaders: CORS_EXPOSED_HEADERS,
  });
  registerErrorHandling(app, runtime);
  await app.register((api) => registerApiRoutes(api, runtime, modules, expectedMigrations), {
    prefix: "/api",
  });

  await app.ready();
  return app;
};
