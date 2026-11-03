// SPDX-FileCopyrightText: 2026 Dominik Wadowski
// SPDX-License-Identifier: FSL-1.1-ALv2

import type { FastifyInstance } from "fastify";
import type { ServerRuntime, ModuleDescriptor } from "../types.js";
import type { Migration } from "@offgrid/db";
import { readinessChecks } from "../readiness/readiness-checks.js";
import { moduleContextFor } from "../module-wiring/module-context-for.js";

export const registerApiRoutes = async (
  api: FastifyInstance,
  runtime: ServerRuntime,
  modules: readonly ModuleDescriptor[],
  expectedMigrations: readonly Migration[],
): Promise<void> => {
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
};
