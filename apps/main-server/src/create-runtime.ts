// SPDX-FileCopyrightText: 2026 Dominik Wadowski
// SPDX-License-Identifier: FSL-1.1-ALv2

import type { ServerConfig, ServerRuntime } from "./types.js";
import { createLogger, createMemoryErrorSink } from "@offgrid/observability";
import { Pool } from "pg";
import { CONNECTION_TIMEOUT_MS } from "./constants.js";
import { createEventBus } from "@offgrid/event-bus";
import { poolForModule } from "./pool-for-module.js";

export const createRuntime = (config: ServerConfig): ServerRuntime => {
  const errorSink = createMemoryErrorSink();
  const logger = createLogger({ level: config.logLevel, bindings: { module: "server" } });
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
  const modulePools = new Map<string, Pool>();
  const connectAs = (moduleName: string): Pool =>
    poolForModule(config.database, modulePools, errorSink, moduleName);

  return {
    pool,
    eventBus: createEventBus({ pool, connectAs, errorSink }),
    errorSink,
    logger,
    database: {
      host: config.database.host,
      port: config.database.port,
      database: config.database.name,
      password: config.database.password,
    },
    moduleDatabases: new Map(),
    modulePools,
    state: { publisherRunning: false, draining: false },
  };
};
