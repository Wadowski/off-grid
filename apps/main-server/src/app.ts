// SPDX-FileCopyrightText: 2026 Dominik Wadowski
// SPDX-License-Identifier: FSL-1.1-ALv2

import rateLimit from "@fastify/rate-limit";
import { loadMigrations, type Migration } from "@offgrid/db";
import { resolveTraceId, runWithTrace } from "@offgrid/observability";
import Fastify, { type FastifyInstance, type FastifyRequest } from "fastify";
import { errorBodyFor, notFoundBody, statusOf } from "./errors.js";
import { resolveRequestContext } from "./request-context.js";
import { moduleContextFor } from "./runtime.js";
import type {
  AppliedMigrationRow,
  AppOptions,
  CheckStatus,
  ModuleDescriptor,
  ReadinessChecks,
  ServerConfig,
  ServerRuntime,
} from "./types.js";

const RATE_WINDOW_MS = 60_000;
const UNMATCHED_ROUTE = "unmatched";

export async function buildApp({ config, runtime, modules }: AppOptions): Promise<FastifyInstance> {
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
}

function registerRequestHooks(
  app: FastifyInstance,
  config: ServerConfig,
  runtime: ServerRuntime,
): void {
  app.addHook("onRequest", (request, reply, done) => {
    const traceId = resolveTraceId(request.headers["x-trace-id"]);
    reply.header("x-trace-id", traceId);
    runWithTrace(traceId, () => done());
  });
  app.addHook("onRequest", async (request) => {
    request.requestContext = resolveRequestContext(request.headers, config.devIdentity);
  });
  app.addHook("onResponse", async (request, reply) => {
    runtime.logger.info("request completed", {
      method: request.method,
      route: routeOf(request),
      status_code: reply.statusCode,
      duration_ms: Math.round(reply.elapsedTime),
    });
  });
}

function registerErrorHandling(app: FastifyInstance, runtime: ServerRuntime): void {
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
}

async function registerApiRoutes(
  api: FastifyInstance,
  runtime: ServerRuntime,
  modules: readonly ModuleDescriptor[],
  expectedMigrations: readonly Migration[],
): Promise<void> {
  api.get("/health", async () => ({ status: "ok" }));
  api.get("/health/ready", async (_request, reply) => {
    const checks = await readinessChecks(runtime, expectedMigrations);
    const ready = Object.values(checks).every((status) => status === "ok");
    reply.code(ready ? 200 : 503);
    return { status: ready ? "ok" : "unavailable", checks };
  });
  for (const module of modules) {
    await module.registerRoutes?.(api, moduleContextFor(runtime, module.name));
  }
}

function routeOf(request: FastifyRequest): string {
  return request.routeOptions.url ?? UNMATCHED_ROUTE;
}

async function loadExpectedMigrations(modules: readonly ModuleDescriptor[]): Promise<Migration[]> {
  const sources = modules.flatMap((module) => module.migrations ?? []);
  return (await Promise.all(sources.map((source) => loadMigrations(source)))).flat();
}

async function readinessChecks(
  runtime: ServerRuntime,
  expectedMigrations: readonly Migration[],
): Promise<ReadinessChecks> {
  return {
    database: await databaseCheck(runtime),
    publisher: runtime.state.publisherRunning && !runtime.state.draining ? "ok" : "stopped",
    migrations: await migrationsCheck(runtime, expectedMigrations),
  };
}

async function databaseCheck(runtime: ServerRuntime): Promise<CheckStatus> {
  try {
    await runtime.pool.query("SELECT 1");
    return "ok";
  } catch (error) {
    logCheckFailure(runtime, "database", error);
    return "unavailable";
  }
}

async function migrationsCheck(
  runtime: ServerRuntime,
  expectedMigrations: readonly Migration[],
): Promise<CheckStatus> {
  if (expectedMigrations.length === 0) {
    return "ok";
  }
  try {
    const { rows } = await runtime.pool.query<AppliedMigrationRow>(
      "SELECT module, name, checksum FROM public.schema_migrations",
    );
    const applied = new Set(rows.map((row) => migrationKey(row.module, row.name, row.checksum)));
    const allApplied = expectedMigrations.every((migration) =>
      applied.has(migrationKey(migration.schema, migration.name, migration.checksum)),
    );
    return allApplied ? "ok" : "pending";
  } catch (error) {
    logCheckFailure(runtime, "migrations", error);
    return "unavailable";
  }
}

function logCheckFailure(runtime: ServerRuntime, check: string, error: unknown): void {
  const errorName = error instanceof Error ? error.name : "NonError";
  runtime.logger.warn("readiness check failed", { check, error_name: errorName });
}

function migrationKey(module: string, name: string, checksum: string): string {
  return `${module}/${name}/${checksum}`;
}
