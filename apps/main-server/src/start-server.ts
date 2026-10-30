// SPDX-FileCopyrightText: 2026 Dominik Wadowski
// SPDX-License-Identifier: FSL-1.1-ALv2

import type { ServerConfig, ModuleDescriptor, RunningServer } from "./types.js";
import { assertValidModules } from "./assert-valid-modules.js";
import { createRuntime } from "./create-runtime.js";
import { registerSubscribersAndCollectWorkers } from "./register-subscribers-and-collect-workers.js";
import type { FastifyInstance } from "fastify";
import { buildApp } from "./build-app.js";
import { disconnectModuleDatabases } from "./disconnect-module-databases.js";
import { shutDown } from "./shut-down.js";
import { startWorkers } from "./start-workers.js";
import { baseUrlOf } from "./base-url-of.js";

export const startServer = async (
  config: ServerConfig,
  modules: readonly ModuleDescriptor[],
): Promise<RunningServer> => {
  assertValidModules(modules);
  const runtime = createRuntime(config);
  const workers = registerSubscribersAndCollectWorkers(modules, runtime);

  let app: FastifyInstance;
  try {
    app = await buildApp({ config, runtime, modules });
  } catch (error) {
    await Promise.all([runtime.pool.end(), disconnectModuleDatabases(runtime)]);
    throw error;
  }

  let closing: Promise<void> | undefined;
  const close = (): Promise<void> => {
    closing ??= shutDown(runtime, workers, () => app.close());
    return closing;
  };

  try {
    await runtime.pool.query("SELECT 1");
    await runtime.eventBus.start();
    runtime.state.publisherRunning = true;
    await startWorkers(workers);
    await app.listen({ host: config.http.host, port: config.http.port });
  } catch (error) {
    await close();
    throw error;
  }

  return { baseUrl: baseUrlOf(app.server.address()), close };
};
