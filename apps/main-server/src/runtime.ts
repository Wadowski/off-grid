// SPDX-FileCopyrightText: 2026 Dominik Wadowski
// SPDX-License-Identifier: FSL-1.1-ALv2

import { createEventBus } from "@offgrid/event-bus";
import { createLogger, createMemoryErrorSink } from "@offgrid/observability";
import { Pool } from "pg";
import type { ModuleContext, ServerConfig, ServerRuntime } from "./types.js";

const CONNECTION_TIMEOUT_MS = 5000;

export function createRuntime(config: ServerConfig): ServerRuntime {
  const errorSink = createMemoryErrorSink();
  const logger = createLogger({ level: config.logLevel, module: "server" });
  const pool = new Pool({
    host: config.database.host,
    port: config.database.port,
    database: config.database.name,
    user: config.database.user,
    password: config.database.password,
    max: config.database.poolMax,
    connectionTimeoutMillis: CONNECTION_TIMEOUT_MS,
  });
  pool.on("error", (error) => errorSink.record(error, { source: "database-pool" }));

  return {
    pool,
    eventBus: createEventBus({ pool, errorSink }),
    errorSink,
    logger,
    state: { publisherRunning: false, draining: false },
  };
}

export function moduleContextFor(runtime: ServerRuntime, moduleName: string): ModuleContext {
  return {
    eventBus: runtime.eventBus,
    logger: runtime.logger.child({ module: moduleName }),
  };
}
