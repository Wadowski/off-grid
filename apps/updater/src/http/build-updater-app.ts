// SPDX-FileCopyrightText: 2026 Dominik Wadowski
// SPDX-License-Identifier: FSL-1.1-ALv2

import Fastify, { type FastifyInstance } from "fastify";
import { API_BODY_LIMIT_BYTES } from "../constants.js";
import type { UpdaterServices } from "../types.js";
import { registerErrorHandling } from "./register-error-handling.js";
import { registerRequestLogging } from "./register-request-logging.js";
import { registerUpdaterRoutes } from "./register-updater-routes.js";
import { requireBearerToken } from "./require-bearer-token.js";

export const buildUpdaterApp = (services: UpdaterServices): FastifyInstance => {
  const app = Fastify({ logger: false, bodyLimit: API_BODY_LIMIT_BYTES });
  app.addHook("onRequest", (request, reply) =>
    requireBearerToken(services.apiToken, request, reply),
  );
  registerRequestLogging(app, services.logger);
  registerErrorHandling(app, services.logger);
  registerUpdaterRoutes(app, services);
  return app;
};
