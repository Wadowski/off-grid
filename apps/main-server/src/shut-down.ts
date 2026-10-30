// SPDX-FileCopyrightText: 2026 Dominik Wadowski
// SPDX-License-Identifier: FSL-1.1-ALv2

import type { ServerRuntime, Worker } from "./types.js";
import { stopWorkers } from "./stop-workers.js";

export const shutDown = async (
  runtime: ServerRuntime,
  workers: readonly Worker[],
  closeHttp: () => Promise<void>,
): Promise<void> => {
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
};
