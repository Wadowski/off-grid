// SPDX-FileCopyrightText: 2026 Dominik Wadowski
// SPDX-License-Identifier: FSL-1.1-ALv2

import type { FastifyInstance } from "fastify";
import type { Migration } from "@offgrid/db";
import type { ServerRuntime } from "../types.js";
import { readinessChecks } from "../readiness/readiness-checks.js";

export const registerGetHealthReady = (
  api: FastifyInstance,
  runtime: ServerRuntime,
  expectedMigrations: readonly Migration[],
): void => {
  api.get("/health/ready", async (_request, reply) => {
    const checks = await readinessChecks(runtime, expectedMigrations);
    const ready = Object.values(checks).every((status) => status === "ok");
    reply.code(ready ? 200 : 503);
    return { status: ready ? "ok" : "unavailable", checks };
  });
};
