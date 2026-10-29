// SPDX-FileCopyrightText: 2026 Dominik Wadowski
// SPDX-License-Identifier: FSL-1.1-ALv2

import rateLimit from "@fastify/rate-limit";
import { resolveTraceId, runWithTrace } from "@offgrid/observability";
import Fastify, { type FastifyInstance } from "fastify";
import { errorBodyFor, notFoundBody, statusOf } from "./errors.js";
import { moduleContextFor } from "./runtime.js";
import { resolveRequestContext } from "./request-context.js";
import type {
  CheckStatus,
  ModuleDescriptor,
  ReadinessChecks,
  ServerConfig,
  ServerRuntime,
} from "./types.js";

const RATE_WINDOW_MS = 60_000;

export interface AppOptions {
  readonly config: ServerConfig;
  readonly runtime: ServerRuntime;
  readonly modules: readonly ModuleDescriptor[];
}

export async function buildApp({ config, runtime, modules }: AppOptions): Promise<FastifyInstance> {
  const app = Fastify({ logger: false });

  app.addHook("onRequest", (request, reply, done) => {
    const traceId = resolveTraceId(request.headers["x-trace-id"]);
    reply.header("x-trace-id", traceId);
    runWithTrace(traceId, () => done());
  });
  app.addHook("onRequest", async (request) => {
    request.requestContext = resolveRequestContext(request.headers, config.devIdentity);
  });

  await app.register(rateLimit, {
    global: true,
    max: config.rateLimitPerMinute,
    timeWindow: RATE_WINDOW_MS,
  });

  app.addHook("onResponse", async (request, reply) => {
    runtime.logger.info("request completed", {
      method: request.method,
      route: request.routeOptions.url ?? "unmatched",
      status_code: reply.statusCode,
      duration_ms: Math.round(reply.elapsedTime),
    });
  });

  app.setErrorHandler((error, request, reply) => {
    const status = statusOf(error);
    if (status >= 500) {
      runtime.errorSink.record(error, { route: request.routeOptions.url ?? "unmatched" });
      runtime.logger.error("request failed", { route: request.routeOptions.url ?? "unmatched" });
    }
    reply.code(status).send(errorBodyFor(error, status));
  });
  app.setNotFoundHandler((_request, reply) => {
    reply.code(404).send(notFoundBody());
  });

  await app.register(
    async (api) => {
      api.get("/health", async () => ({ status: "ok" }));
      api.get("/health/ready", async (_request, reply) => {
        const checks = await readinessChecks(runtime, modules);
        const ready = Object.values(checks).every((status) => status === "ok");
        reply.code(ready ? 200 : 503);
        return { status: ready ? "ok" : "unavailable", checks };
      });
      for (const module of modules) {
        await module.registerRoutes?.(api, moduleContextFor(runtime, module.name));
      }
    },
    { prefix: "/api" },
  );

  await app.ready();
  return app;
}

async function readinessChecks(
  runtime: ServerRuntime,
  modules: readonly ModuleDescriptor[],
): Promise<ReadinessChecks> {
  return {
    database: await databaseCheck(runtime),
    publisher: runtime.state.publisherRunning && !runtime.state.draining ? "ok" : "stopped",
    migrations: migrationsCheck(modules),
  };
}

async function databaseCheck(runtime: ServerRuntime): Promise<CheckStatus> {
  try {
    await runtime.pool.query("SELECT 1");
    return "ok";
  } catch {
    return "unavailable";
  }
}

function migrationsCheck(modules: readonly ModuleDescriptor[]): CheckStatus {
  const hasMigrations = modules.some((module) => (module.migrations?.length ?? 0) > 0);
  return hasMigrations ? "not_checked" : "ok";
}
