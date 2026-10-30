// SPDX-FileCopyrightText: 2026 Dominik Wadowski
// SPDX-License-Identifier: FSL-1.1-ALv2

import Fastify from "fastify";
import rateLimit from "@fastify/rate-limit";
import type { AppOptions } from "./types.js";
import type { FastifyInstance } from "fastify";
import { loadExpectedMigrations } from "./load-expected-migrations.js";
import { registerRequestHooks } from "./register-request-hooks.js";
import { RATE_WINDOW_MS } from "./constants.js";
import { registerErrorHandling } from "./register-error-handling.js";
import { registerApiRoutes } from "./register-api-routes.js";

export const buildApp = async ({
  config,
  runtime,
  modules,
}: AppOptions): Promise<FastifyInstance> => {
  const expectedMigrations = await loadExpectedMigrations(modules);
  const app = Fastify({ logger: false });

  registerRequestHooks(app, config, runtime);
  await app.register(rateLimit, {
    global: true,
    max: config.rateLimitPerMinute,
    timeWindow: RATE_WINDOW_MS,
  });
  registerErrorHandling(app, runtime);
  await app.register((api) => registerApiRoutes(api, runtime, modules, expectedMigrations), {
    prefix: "/api",
  });

  await app.ready();
  return app;
};
