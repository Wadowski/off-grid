// SPDX-FileCopyrightText: 2026 Dominik Wadowski
// SPDX-License-Identifier: FSL-1.1-ALv2

import { Pool } from "pg";
import type { ErrorSink } from "@offgrid/observability";
import { isDatabaseSchema } from "@offgrid/db";
import { CONNECTION_TIMEOUT_MS } from "./constants.js";
import type { DatabaseConnection } from "./types.js";

export const poolForModule = (
  database: DatabaseConnection,
  pools: Map<string, Pool>,
  errorSink: ErrorSink,
  moduleName: string,
): Pool => {
  const existing = pools.get(moduleName);
  if (existing !== undefined) {
    return existing;
  }
  if (!isDatabaseSchema(moduleName)) {
    throw new Error(`module ${moduleName} has no database schema`);
  }
  const pool = new Pool({
    host: database.host,
    port: database.port,
    database: database.name,
    user: `${moduleName}_app`,
    password: database.password,
    max: database.poolMax,
    connectionTimeoutMillis: CONNECTION_TIMEOUT_MS,
  });
  pool.on("error", (error) =>
    errorSink.record(error, { source: "module-pool", module: moduleName }),
  );
  pools.set(moduleName, pool);
  return pool;
};
