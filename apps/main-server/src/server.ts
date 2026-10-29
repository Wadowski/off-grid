// SPDX-FileCopyrightText: 2026 Dominik Wadowski
// SPDX-License-Identifier: FSL-1.1-ALv2

import type { AddressInfo } from "node:net";
import type { FastifyInstance } from "fastify";
import { buildApp } from "./app.js";
import { assertValidModules } from "./modules.js";
import { createRuntime, moduleContextFor } from "./runtime.js";
import type {
  ModuleDescriptor,
  RunningServer,
  ServerConfig,
  ServerRuntime,
  Worker,
} from "./types.js";

export async function startServer(
  config: ServerConfig,
  modules: readonly ModuleDescriptor[],
): Promise<RunningServer> {
  assertValidModules(modules);
  const runtime = createRuntime(config);
  const workers = registerSubscribersAndCollectWorkers(modules, runtime);

  let app: FastifyInstance;
  try {
    app = await buildApp({ config, runtime, modules });
  } catch (error) {
    await runtime.pool.end();
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
}

function registerSubscribersAndCollectWorkers(
  modules: readonly ModuleDescriptor[],
  runtime: ServerRuntime,
): Worker[] {
  const workers: Worker[] = [];
  for (const module of modules) {
    const context = moduleContextFor(runtime, module.name);
    module.registerSubscribers?.(context);
    workers.push(...(module.workers?.(context) ?? []));
  }
  return workers;
}

async function startWorkers(workers: readonly Worker[]): Promise<void> {
  for (const worker of workers) {
    await worker.start();
  }
}

async function stopWorkers(workers: readonly Worker[]): Promise<void> {
  for (const worker of [...workers].reverse()) {
    await worker.stop();
  }
}

async function shutDown(
  runtime: ServerRuntime,
  workers: readonly Worker[],
  closeHttp: () => Promise<void>,
): Promise<void> {
  runtime.state.draining = true;
  const steps: readonly (() => Promise<unknown>)[] = [
    closeHttp,
    () => stopWorkers(workers),
    () => runtime.eventBus.stop(),
    async () => {
      runtime.state.publisherRunning = false;
    },
    () => runtime.pool.end(),
  ];
  const failures: unknown[] = [];
  for (const step of steps) {
    try {
      await step();
    } catch (error) {
      failures.push(error);
    }
  }
  if (failures.length > 0) {
    throw failures[0];
  }
}

function baseUrlOf(address: AddressInfo | string | null): string {
  if (address === null || typeof address === "string") {
    throw new Error("server is not listening on a TCP port");
  }
  return `http://${address.address}:${address.port}`;
}
