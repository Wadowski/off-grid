// SPDX-FileCopyrightText: 2026 Dominik Wadowski
// SPDX-License-Identifier: FSL-1.1-ALv2

import type { FastifyInstance } from "fastify";
import type { ServerRuntime, ModuleDescriptor } from "../types.js";
import type { Migration } from "@offgrid/db";
import { moduleContextFor } from "../module-wiring/module-context-for.js";
import { registerGetHealth } from "./register-get-health.js";
import { registerGetHealthReady } from "./register-get-health-ready.js";
import { registerMeRoute } from "./register-me-route.js";

export const registerApiRoutes = async (
  api: FastifyInstance,
  runtime: ServerRuntime,
  modules: readonly ModuleDescriptor[],
  expectedMigrations: readonly Migration[],
): Promise<void> => {
  registerGetHealth(api);
  registerGetHealthReady(api, runtime, expectedMigrations);
  registerMeRoute(api, runtime);
  for (const module of modules) {
    await module.registerRoutes?.(api, moduleContextFor(runtime, module.name));
  }
};
